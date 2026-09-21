import { api, ApiError } from "./api";
import type {
  PaymentView,
  FreeResult,
  MemberResult,
} from "./generated/contract";

const polling = { intervalMs: 1000, deadlineMs: 90_000 } as const;
const resultRefresh = { attempts: 3, intervalMs: 1000 } as const;

export async function loadPaidResult(
  assessmentId: string,
): Promise<MemberResult> {
  for (let attempt = 0; attempt < resultRefresh.attempts; attempt++) {
    try {
      const result = await api<FreeResult | MemberResult>(
        `/api/assessments/${assessmentId}/result`,
      );
      if (result.access === "member") return result;
    } catch (error) {
      if (
        !(error instanceof ApiError) ||
        !["NETWORK", "SERVICE_UNAVAILABLE"].includes(error.code)
      )
        throw error;
    }
    if (attempt + 1 < resultRefresh.attempts)
      await new Promise((resolve) =>
        setTimeout(resolve, resultRefresh.intervalMs),
      );
  }
  throw new ApiError(
    "PAYMENT_RESULT_PENDING",
    "支付已成功，评估暂未更新，请重试加载，无需再次支付。",
  );
}

async function waitForPayment(
  id: string,
  checkout: boolean,
): Promise<PaymentView> {
  const deadline = Date.now() + polling.deadlineMs;
  while (Date.now() < deadline) {
    const payment = await api<PaymentView>(`/api/payments/${id}`);
    if (payment.status === "failed" || payment.status === "closed")
      throw new ApiError("PAYMENT_FAILED", "PAYMENT_FAILED");
    if (payment.status === "succeeded" || (checkout && payment.checkoutUrl))
      return payment;
    await new Promise((resolve) => setTimeout(resolve, polling.intervalMs));
  }
  throw new ApiError("PAYMENT_PENDING", "PAYMENT_PENDING");
}

export async function completeDemoPayment(key: string): Promise<void> {
  const payment = await api<PaymentView>(
    "/api/payments",
    "POST",
    { planId: "wellnest-demo" },
    key,
  );
  const ready = await waitForPayment(payment.id, true);
  if (ready.status === "succeeded") return;
  const checkout = new URL(ready.checkoutUrl!, window.location.origin);
  // Only the demo provider is supported. Never send a session to arbitrary checkout URLs.
  if (!/^\/api\/mock-checkout\/[A-Za-z0-9_-]+$/.test(checkout.pathname))
    throw new ApiError("PAYMENT_FAILED", "PAYMENT_FAILED");
  await api(`${checkout.pathname}/confirm`, "POST", { outcome: "succeeded" });
  await waitForPayment(payment.id, false);
}
