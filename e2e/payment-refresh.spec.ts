import { test, expect } from "@playwright/test";

for (const recovery of ["automatic", "manual", "activation"] as const) {
  test(`confirmed payment closes dialog and refreshes result: ${recovery}`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem("wellnest.locale", "zh-CN"),
    );
    const id = "purchased-assessment";
    const answers = {
      sex: "female",
      goal: "lose",
      age: 35,
      heightCm: 165,
      weightKg: 75,
      targetWeightKg: 65,
      activity: "light",
      secondaryGoals: ["energy"],
      experience: "beginner",
      dailyActivity: "seated",
      limitations: ["none"],
      sleep: "variable",
      energy: "afternoon_dip",
      mealRhythm: "irregular_meals",
      foodHabits: ["sweet_drinks"],
      barrier: "time",
      timeWindow: "evening",
    };
    const assessment = {
      id,
      answers,
      status: "completed",
      version: 2,
      flowVersion: "lifestyle-v3",
      resumeStepId: "result",
      completedSteps: [],
      missingFields: [],
      updatedAt: "2026-09-21T00:00:00Z",
      planPreview: null,
    };
    const result = {
      assessmentId: id,
      bmi: 27.5,
      bmiCategory: "overweight",
      summary: "personal_start",
      planPreview: null,
    };
    let confirmed = false,
      resultReads = 0,
      paymentCreates = 0,
      sessionReads = 0;
    let allowResult = recovery !== "manual";
    let allowEntitlement = recovery !== "activation";
    await page.route("**/api/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      const json = (body: unknown, status = 200) =>
        route.fulfill({ status, json: body });
      if (path === "/api/sessions") return json({});
      if (path === "/api/session") {
        sessionReads++;
        // A session reload after payment used to leave the modal stuck on failure.
        return confirmed
          ? json({ error: { code: "SERVICE_UNAVAILABLE" } }, 503)
          : json({ assessment });
      }
      if (path === "/api/payments") {
        paymentCreates++;
        return json({ id: "payment-1", status: "pending" });
      }
      if (path === "/api/payments/payment-1") {
        if (recovery === "activation" && !allowEntitlement)
          return json({
            id: "payment-1",
            status: "pending",
            checkoutUrl: "/api/mock-checkout/test-token",
          });
        confirmed = true;
        return json({ id: "payment-1", status: "succeeded" });
      }
      if (path === "/api/mock-checkout/test-token/confirm") {
        confirmed = true;
        return json({ status: "succeeded" });
      }
      if (path === `/api/assessments/${id}/result`) {
        if (!confirmed)
          return json({ ...result, access: "free", lockedFeatures: [] });
        resultReads++;
        if (!allowResult || resultReads < 3)
          return json({ error: { code: "SERVICE_UNAVAILABLE" } }, 503);
        return json({
          ...result,
          access: "member",
          calculation: {
            bmi: 27.5,
            bmiCategory: "overweight",
            restingKcal: 1450,
            maintenanceKcal: 1950,
            suggestedKcal: 1650,
            weeklyChangeKg: -0.3,
            calculatedOn: "2026-09-21",
            predictedGoalDate: "2027-05-21",
            algorithmVersion: "wellness-v2",
            projection: [
              { date: "2026-09-21", weightKg: 75 },
              { date: "2027-05-21", weightKg: 65 },
            ],
            assumptions: [],
            guidance: null,
            planPreview: null,
          },
        });
      }
      throw new Error(`Unexpected API call ${path}`);
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "查看我的完整评估", exact: true })
      .click();
    await page
      .getByRole("button", { name: "模拟支付并解锁", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    if (recovery === "activation") {
      await expect(page.getByRole("status")).toContainText("付款已确认");
      expect(resultReads).toBe(0);
      await expect(page.locator(".chart")).toHaveCount(0);
      await expect(page.locator(".calorie-number")).toHaveCount(0);
      allowEntitlement = true;
    }
    if (recovery === "manual") {
      const retry = page.getByRole("button", {
        name: "重新加载已解锁评估",
        exact: true,
      });
      await expect(retry).toBeVisible();
      allowResult = true;
      await retry.click();
    }
    await expect(
      page.getByRole("heading", { name: "你的完整评估", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".calorie-number")).toContainText("1650");
    expect(paymentCreates).toBe(1);
    expect(sessionReads).toBe(1);
    expect(resultReads).toBe(recovery === "manual" ? 4 : 3);
  });
}
