import { useI18n, I18nProvider, LanguageSwitcher } from "./i18n";
import { ProfileQuestion } from "./components/ProfileQuestion";
import { PersonalPlan } from "./components/PersonalPlan";
import {
  profileQuestions,
  profileLabels,
  profileFeedback,
  selectedValues,
} from "./profile";
import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import "./style.css";
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/manrope";
import "./dashboard.css";

import { useAssessmentFlow } from "./useAssessmentFlow";
import {
  fields,
  labels,
  feedbackForChoice,
  stageForStep,
  currentFlow,
} from "./flow";
import { type Step, type Goal } from "./generated/contract";
import { api } from "./api";
import { HealthDashboard } from "./components/HealthDashboard";
import { Modal } from "./components/Modal";
import { imagery, choiceImagery } from "./imagery";
import { ChoicePhoto } from "./components/ChoicePhoto";
import { measurementFeedback, storySteps } from "./components/MeasurementStory";
import { MeasurementPicker } from "./components/MeasurementPicker";
import { GuidedResponse, guidanceSteps } from "./components/GuidedResponse";
function App() {
  const { t } = useI18n();
  const {
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
  } = useAssessmentFlow();
  const resultImage =
    assessment?.answers.sex === "male" ? imagery.movement : imagery.hero;
  const isProfile = !!profileQuestions[step];
  const isProfileResponse = ["movement_feedback", "habits_feedback"].includes(
    step,
  );
  const isGuidance = guidanceSteps.includes(step) || isProfileResponse;
  const questionSteps = steps.filter((s) => s in fields);
  const questionProgress = questionSteps.filter(
    (s) => steps.indexOf(s) < index,
  ).length;
  return (
    <div className="app">
      <header className="site-header">
        <div className="header-left">
          {isQuiz && (
            <button
              className="back-button"
              aria-label={t("返回")}
              disabled={busy}
              onClick={() =>
                execute(() =>
                  save(assessment!, {}, steps[Math.max(0, index - 1)]),
                )
              }
            >
              <ArrowLeft size={22} />
            </button>
          )}
          <a href="/" className="brand">
            Wellnest
          </a>
        </div>
        {isQuiz && (
          <span className="header-stage">{t(stageForStep[step])}</span>
        )}
        <div className="header-tools">
          {isQuiz && (
            <span className="step-count">
              {questionProgress} / {questionSteps.length}
            </span>
          )}
          <LanguageSwitcher />
        </div>
      </header>
      {isQuiz && assessment && assessment.flowVersion !== currentFlow && (
        <aside className="resume-notice">
          <span>{t("已继续上次的测评。想了解更多生活习惯？")}</span>
          <button disabled={busy} onClick={() => restart(true)}>
            {t("开始新版测评")}
            <ArrowRight size={15} />
          </button>
        </aside>
      )}
      {isQuiz && (
        <div
          className="progress"
          aria-label={t(`测评进度 ${questionProgress}/${questionSteps.length}`)}
        >
          {Array.from({ length: questionSteps.length }, (_, i) => (
            <span key={i} className={i < questionProgress ? "done" : ""} />
          ))}
        </div>
      )}
      <main
        key={step}
        className={`content page-enter ${isProfile ? "profile-content" : q?.options ? "choice-content" : storySteps.includes(step) ? "measurement-content" : ""} ${step === "result" ? "result-content" : step === "welcome" || isGuidance ? "wide-content" : ""}`}
      >
        {step === "welcome" && (
          <section className="welcome">
            <span className="eyebrow">{t("找到适合你的改变方式")}</span>
            <h1 tabIndex={-1}>{t("你希望从哪里开始？")}</h1>
            <p className="subtitle">{t("选择你的目标，我们一步一步来。")}</p>
            <div
              className="entry-choices"
              role="radiogroup"
              aria-label={t("选择你的目标")}
            >
              {(["lose", "maintain", "gain"] as Goal[]).map((goal) => (
                <button
                  type="button"
                  role="radio"
                  aria-label={t(labels[goal])}
                  aria-checked={value === goal}
                  className={`entry-choice ${value === goal ? "selected" : ""}`}
                  key={goal}
                  disabled={busy || !ready}
                  onClick={() => setValue(goal)}
                >
                  <ChoicePhoto kind={goal} sex={assessment?.answers.sex} />
                  <span>
                    {t(labels[goal])}
                    <span className="radio">
                      {value === goal ? (
                        <Check size={16} />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <p
              key={value}
              className="selection-response feedback-enter"
              role="status"
            >
              {t(
                feedbackForChoice(value, assessment?.answers.sex) ||
                  "选一个最接近你想法的目标",
              )}
            </p>
            <button
              className="primary"
              disabled={
                busy || !ready || !["lose", "maintain", "gain"].includes(value)
              }
              onClick={() => begin(value as Goal)}
            >
              {t(busy ? "准备中…" : "开始我的测评")}
              <ArrowRight size={18} />
            </button>
            <p className="micro">{t("按自己的节奏 · 可以随时返回修改")}</p>
          </section>
        )}
        {isGuidance && !isProfileResponse && assessment && (
          <GuidedResponse
            step={step}
            answers={assessment.answers}
            busy={busy}
            disabled={busy || conflict}
            onContinue={continueGuidance}
          />
        )}
        {isProfileResponse && assessment && (
          <section className="profile-response">
            <span className="eyebrow">{t("你刚才告诉我们的")}</span>
            <h1 tabIndex={-1}>
              {t(
                step === "movement_feedback"
                  ? "从你的活动起点开始"
                  : "让改变融入你的日常",
              )}
            </h1>
            <PersonalPlan
              plan={assessment.planPreview}
              stage={step === "movement_feedback" ? "movement" : "habits"}
            />
            <div className="action-bar">
              <button
                className="primary"
                disabled={busy || conflict}
                onClick={continueGuidance}
              >
                {t("继续")}
              </button>
            </div>
          </section>
        )}
        {q && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isValid) void advance();
            }}
          >
            <h1 tabIndex={-1}>{t(q.title)}</h1>
            {isProfile ? (
              <ProfileQuestion
                step={step}
                value={value}
                onChange={setValue}
                disabled={busy}
                answers={assessment?.answers}
              />
            ) : q.options ? (
              <div
                className={`options illustrated-options options-${step}`}
                role="radiogroup"
                aria-label={t(q.title)}
              >
                {q.options.map((option) => (
                  <button
                    type="button"
                    role="radio"
                    aria-label={t(labels[option])}
                    aria-checked={value === option}
                    className={`option ${value === option ? "selected" : ""}`}
                    disabled={busy}
                    onClick={() => setValue(option)}
                    key={option}
                  >
                    <ChoicePhoto
                      kind={option as keyof typeof choiceImagery}
                      sex={assessment?.answers.sex}
                    />
                    <span>{t(labels[option])}</span>
                    <span className="radio">
                      {value === option && <Check size={14} />}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <MeasurementPicker
                key={step}
                step={step}
                {...q}
                value={value}
                onChange={setValue}
                disabled={busy}
                answers={assessment?.answers}
              />
            )}
            <div
              className={`action-bar ${q.options || storySteps.includes(step) ? "with-response" : ""}`}
            >
              {(q.options || storySteps.includes(step)) && (
                <p
                  key={value}
                  className="selection-response feedback-enter"
                  role="status"
                >
                  {t(
                    isProfile
                      ? selectedValues(value)
                          .map((v) => profileFeedback[v])
                          .filter(Boolean)
                          .slice(-1)[0] || "选择符合你的情况，没有标准答案。"
                      : q.options
                        ? feedbackForChoice(value, assessment?.answers.sex) ||
                          "选择最接近你的情况，没有标准答案。"
                        : measurementFeedback(
                            step,
                            value,
                            isValid,
                            assessment?.answers,
                          ),
                  )}
                </p>
              )}
              <button
                className="primary"
                disabled={busy || !isValid || conflict}
              >
                {t(busy ? "保存中…" : "继续")}
              </button>
            </div>
          </form>
        )}
        {step === "review" && assessment && (
          <section>
            <h1 tabIndex={-1}>{t("确认你的信息")}</h1>
            <p className="review-intro">
              {t("你的目标：")}
              {t(labels[assessment.answers.goal!])}
              {t("。看看这些信息是否符合现在的你。")}
            </p>
            <dl className="review">
              {Object.entries(fields)
                .filter(([s]) => steps.includes(s as Step))
                .map(([s, f]) => (
                  <div key={s}>
                    <dt>
                      {t(
                        (
                          {
                            sex: "性别",
                            goal: "目标",
                            age: "年龄",
                            height: "身高",
                            weight: "当前体重",
                            target: "目标体重",
                            activity: "运动频率",
                          } as Record<string, string>
                        )[s] || questions[s]?.title.replace("？", ""),
                      )}
                    </dt>
                    <dd>
                      {t(
                        Array.isArray(assessment.answers[f])
                          ? (assessment.answers[f] as string[])
                              .map((v) => profileLabels[v] || v)
                              .join("、")
                          : labels[String(assessment.answers[f])] ||
                              String(assessment.answers[f] ?? "—"),
                      )}
                      {t(" ")}
                      {t(questions[s].unit)}
                      {!(
                        s === "target" && assessment.answers.goal === "maintain"
                      ) && (
                        <button
                          aria-label={t(`修改${s}`)}
                          disabled={busy}
                          onClick={() => edit(s as Step)}
                        >
                          {t("修改")}
                        </button>
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
            <div className="action-bar">
              <button
                className="primary"
                disabled={busy || conflict}
                onClick={submit}
              >
                {t(busy ? "生成中…" : "查看我的评估")}
              </button>
            </div>
          </section>
        )}
        {computing && step === "review" && (
          <div className="assessment-loading" role="status">
            <span className="loading-orbit" />
            <h2>{t("正在整理你的评估")}</h2>
            <p>{t("结合你刚才的选择，计算身体概况与目标参考。")}</p>
          </div>
        )}
        {step === "result" && result && assessment && (
          <HealthDashboard
            result={result}
            answers={assessment.answers}
            busy={busy}
            onUnlock={() =>
              paidAssessmentId ? retryPaidResult() : setPaywall(true)
            }
            onRestart={() => restart()}
            onRetry={retryGuidance}
          />
        )}
        {paidAssessmentId && busy && (
          <p role="status">{t("支付已成功，正在更新评估…")}</p>
        )}
        {t(
          error && (
            <div className="error" role="alert">
              {t(error)}
              {paidAssessmentId ? (
                <button disabled={busy} onClick={retryPaidResult}>
                  {t("重新加载已解锁评估")}
                </button>
              ) : conflict ? (
                <button onClick={() => execute(restore)}>
                  {t("载入最新进度")}
                </button>
              ) : !ready ? (
                <button
                  onClick={() =>
                    execute(async () => {
                      await api("/api/sessions", "POST", {});
                      await restore();
                    })
                  }
                >
                  {t("重新连接")}
                </button>
              ) : null}
            </div>
          ),
        )}
      </main>
      {paywall && (
        <Modal busy={busy} onClose={() => setPaywall(false)}>
          <button
            className="close"
            aria-label={t("关闭")}
            disabled={busy}
            onClick={() => setPaywall(false)}
          >
            <X size={22} />
          </button>
          <img className="pay-photo" src={resultImage.src} alt="" />
          <span className="eyebrow">{t("专属于你的下一步")}</span>
          <h2 id="pay-title">{t("解锁完整评估")}</h2>
          <ul className="plan-includes">
            <li>
              <Check size={18} />
              {t("每日热量建议")}
            </li>
            <li>
              <Check size={18} />
              {t("目标预测日期")}
            </li>
            <li>
              <Check size={18} />
              {t("体重变化曲线")}
            </li>
          </ul>
          <div className="price">
            <span>{t("完整评估")}</span>
            <strong>¥0</strong>
          </div>
          <button className="primary" disabled={busy} onClick={pay}>
            {t(busy ? "正在解锁…" : "模拟支付并解锁")}
          </button>
          {t(
            error && (
              <p role="alert" className="error">
                {t(error)}
              </p>
            ),
          )}
          <p className="micro">{t("模拟支付，不会扣费")}</p>
        </Modal>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
