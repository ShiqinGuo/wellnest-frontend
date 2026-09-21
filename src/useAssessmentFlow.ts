import { completeDemoPayment, loadPaidResult, waitForPayment } from "./payment";
import { selectedValues } from "./profile";
import { errorMessages } from "./locales/errors";
import { useEffect, useLayoutEffect, useState } from "react";
import { api, ApiError } from "./api";
import type {
  Answers,
  AssessmentView as Assessment,
  FreeResult,
  MemberResult,
  Step,
} from "./generated/contract";
import {
  fields,
  visibleSteps,
  firstMissing,
  questions as getQuestions,
  guidedFlow,
  currentFlow,
} from "./flow";
type Result = FreeResult | MemberResult;
let initialization: Promise<unknown> | undefined;
export function useAssessmentFlow() {
  const [assessment, setAssessment] = useState<Assessment | null>(null),
    [step, setStep] = useState<Step>("welcome"),
    [value, setValue] = useState<string>(""),
    [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [conflict, setConflict] = useState(false),
    [paywall, setPaywall] = useState(false);
  const [pending, setPending] = useState<{
    signature: string;
    key: string;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [computing, setComputing] = useState(false);
  const [paidAssessmentId, setPaidAssessmentId] = useState<string | null>(null);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(
    null,
  );
  const steps = visibleSteps(assessment?.answers, assessment?.flowVersion);
  const questions = getQuestions(assessment?.answers);
  const [ready, setReady] = useState(false);
  async function restore(active: () => boolean = () => true) {
    const session = await api<{ assessment: Assessment | null }>(
      "/api/session",
    );
    const current = session.assessment;
    const restoredResult =
      current?.status === "completed"
        ? await api<Result>(`/api/assessments/${current.id}/result`)
        : null;
    if (!active()) return;
    setAssessment(session.assessment);
    setEditing(
      current?.status === "draft" &&
        current.missingFields.length === 0 &&
        current.resumeStepId !== "welcome",
    );
    if (current?.status === "completed") {
      setResult(restoredResult);
      setStep("result");
    } else
      setStep(
        current?.resumeStepId === "target" &&
          current.answers.goal === "maintain"
          ? "activity"
          : current?.resumeStepId || "welcome",
      );
    setConflict(false);
    setPending(null);
    setReady(true);
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        initialization ??= api("/api/sessions", "POST", {}).catch((error) => {
          initialization = undefined;
          throw error;
        });
        await initialization;
        if (active) await restore(() => active);
      } catch (e) {
        if (active) setError(message(e));
      } finally {
        if (active) setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  useLayoutEffect(() => {
    setValue(
      String(assessment?.answers[fields[step as keyof typeof fields]] ?? ""),
    );
  }, [step, assessment]);
  useEffect(() => {
    window.scrollTo(0, 0);
    document
      .querySelector<HTMLHeadingElement>("h1")
      ?.focus({ preventScroll: true });
  }, [step]);
  function message(e: unknown) {
    if (e instanceof ApiError && errorMessages[e.code])
      return errorMessages[e.code];
    return e instanceof Error ? e.message : "网络连接中断，请重试";
  }
  async function execute(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(message(e));
      if (e instanceof ApiError && e.code === "VERSION_CONFLICT")
        setConflict(true);
    } finally {
      setBusy(false);
    }
  }
  function operation(path: string, body: unknown) {
    const signature = JSON.stringify([path, body]);
    if (pending?.signature === signature) return pending.key;
    const key = crypto.randomUUID();
    setPending({ signature, key });
    return key;
  }
  async function begin(goal: Answers["goal"]) {
    await execute(async () => {
      let a = assessment;
      if (!a) {
        const body = {};
        a = await api<Assessment>(
          "/api/assessments",
          "POST",
          body,
          operation("/api/assessments", body),
        );
      }
      await save(
        a,
        { goal, targetWeightKg: null },
        [guidedFlow, currentFlow].includes(a.flowVersion as typeof guidedFlow)
          ? "goal_feedback"
          : "sex",
      );
    });
  }
  async function save(a: Assessment, answers: Partial<Answers>, next: Step) {
    const path = `/api/assessments/${a.id}`;
    const body = { expectedVersion: a.version, answers, resumeStepId: next };
    const updated = await api<Assessment>(
      path,
      "PATCH",
      body,
      operation(path, body),
    );
    setAssessment(updated);
    setStep(updated.resumeStepId);
    setPending(null);
  }
  async function advance() {
    if (!assessment) return;
    await execute(async () => {
      const field = fields[step as keyof typeof fields],
        q = questions[step];
      let next: Step = steps[steps.indexOf(step as (typeof steps)[number]) + 1];
      let answer: Partial<Answers> = {
        [field]: q.multi
          ? selectedValues(value)
          : q.options
            ? value
            : Number(value),
      };
      if (step === "goal" && value !== assessment.answers.goal)
        answer.targetWeightKg = null;
      if (step === "weight" && Number(value) !== assessment.answers.weightKg)
        answer.targetWeightKg = null;
      if (step === "height" && Number(value) !== assessment.answers.heightCm)
        answer.targetWeightKg = null;
      if (step === "weight" && assessment.answers.goal === "maintain")
        answer.targetWeightKg = Number(value);
      if (step === "barrier" && value !== "time") answer.timeWindow = null;
      const combined = { ...assessment.answers, ...answer };
      if (combined.goal === "maintain")
        answer.targetWeightKg = combined.weightKg;
      const merged = { ...assessment.answers, ...answer };
      const mergedSteps = visibleSteps(merged, assessment.flowVersion);
      next = mergedSteps[mergedSteps.indexOf(step) + 1];
      if (editing) next = firstMissing(merged, assessment.flowVersion);
      await save(assessment, answer, next);
      if (next === "review") setEditing(false);
    });
  }
  async function continueGuidance() {
    if (assessment) await execute(() => save(assessment, {}, steps[index + 1]));
  }
  async function submit() {
    if (!assessment) return;
    setComputing(true);
    try {
      await execute(async () => {
        const path = `/api/assessments/${assessment.id}/submit`;
        const body = { expectedVersion: assessment.version };
        await api(path, "POST", body, operation(path, body));
        await restore();
      });
    } finally {
      setComputing(false);
    }
  }
  async function pay() {
    if (!assessment) return;
    const assessmentId = assessment.id;
    await execute(async () => {
      const body = { planId: "wellnest-demo" };
      try {
        await completeDemoPayment(
          operation("/api/payments", body),
          (paymentId) => {
            setConfirmingPaymentId(paymentId);
            setPaidAssessmentId(assessmentId);
            setPaywall(false);
            setPending(null);
          },
        );
      } catch (error) {
        if (error instanceof ApiError && error.code === "PAYMENT_FAILED")
          setPending(null);
        if (!(error instanceof ApiError && error.code === "ALREADY_SUBSCRIBED"))
          throw error;
      }
      // The payment is final even if the subsequent result read fails.
      // Refresh the purchased assessment, not whichever draft is now current.
      setPaidAssessmentId(assessmentId);
      setConfirmingPaymentId(null);
      setPaywall(false);
      setPending(null);
      setResult(await loadPaidResult(assessmentId));
      setStep("result");
      setPaidAssessmentId(null);
    });
  }
  async function retryPaidResult() {
    if (!paidAssessmentId) return;
    await execute(async () => {
      if (confirmingPaymentId) {
        await waitForPayment(confirmingPaymentId, false);
        setConfirmingPaymentId(null);
      }
      setResult(await loadPaidResult(paidAssessmentId));
      setStep("result");
      setPaidAssessmentId(null);
    });
  }
  async function restart(fresh = false) {
    await execute(async () => {
      const path = "/api/assessments";
      const body = fresh
        ? { startNew: true }
        : { sourceAssessmentId: assessment?.id, startNew: true };
      const a = await api<Assessment>(
        path,
        "POST",
        body,
        operation(path, body),
      );
      setAssessment(a);
      setResult(null);
      setPaidAssessmentId(null);
      setEditing(false);
      setConfirmingPaymentId(null);
      setConflict(false);
      setStep(a.resumeStepId);
      setPending(null);
    });
  }
  const q = questions[step],
    index = steps.indexOf(step as (typeof steps)[number]),
    isValid = q?.options
      ? !!value
      : value !== "" &&
        Number.isFinite(Number(value)) &&
        Number(value) >= q?.min! &&
        Number(value) <= q?.max! &&
        (step !== "age" || Number.isInteger(Number(value)));
  const isQuiz = step !== "welcome" && step !== "result";
  async function edit(next: Step) {
    setEditing(true);
    await execute(() => save(assessment!, {}, next));
  }
  async function retryGuidance() {
    if (!assessment || result?.access !== "member") return;
    await execute(async () => {
      const path = `/api/assessments/${assessment.id}/guidance/retry`;
      const body = {
        expectedVersion: result.calculation.guidance?.revision ?? 0,
      };
      await api(path, "POST", body, operation(path, body));
      await restore();
    });
  }
  return {
    assessment,
    step,
    value,
    setValue,
    result,
    busy,
    error,
    conflict,
    paywall,
    setPaywall,
    ready,
    restore,
    execute,
    begin,
    save,
    advance,
    submit,
    pay,
    paidAssessmentId,
    confirmingPaymentId,
    retryPaidResult,
    restart,
    q,
    index,
    isValid,
    isQuiz,
    steps,
    questions,
    edit,
    retryGuidance,
    continueGuidance,
    computing,
  };
}
