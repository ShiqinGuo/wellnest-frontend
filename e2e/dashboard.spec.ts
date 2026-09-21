import { test, expect } from "@playwright/test";
import { paymentExpectation } from "./helpers";

const answers = {
  sex: "female",
  goal: "lose",
  age: 35,
  heightCm: 165,
  weightKg: 75,
  targetWeightKg: 65,
  activity: "light",
  secondaryGoals: ["energy", "routine"],
  experience: "beginner",
  dailyActivity: "seated",
  limitations: ["none"],
  sleep: "variable",
  energy: "afternoon_dip",
  mealRhythm: "irregular_meals",
  foodHabits: ["sweet_drinks", "late_snacks"],
  barrier: "time",
  timeWindow: "evening",
};
const headers = () => ({ "Idempotency-Key": crypto.randomUUID() });

test("支付失败后换新操作键，重新支付仍经服务端开通", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "桌面支付恢复验收");
  await page.request.post("/api/sessions", { data: {} });
  const assessment = await (
    await page.request.post("/api/assessments", {
      data: {},
      headers: headers(),
    })
  ).json();
  expect(
    (
      await page.request.patch(`/api/assessments/${assessment.id}`, {
        headers: headers(),
        data: { expectedVersion: 0, answers, resumeStepId: "review" },
      })
    ).ok(),
  ).toBe(true);
  expect(
    (
      await page.request.post(`/api/assessments/${assessment.id}/submit`, {
        headers: headers(),
        data: { expectedVersion: 1 },
      })
    ).ok(),
  ).toBe(true);
  await page.goto("/");
  await page
    .getByRole("button", { name: "查看我的完整评估", exact: true })
    .click();
  const keys: string[] = [];
  page.on("request", (request) => {
    if (
      new URL(request.url()).pathname === "/api/payments" &&
      request.method() === "POST"
    )
      keys.push(request.headers()["idempotency-key"]);
  });
  await page.route("**/api/mock-checkout/*/confirm", (route) =>
    route.continue({ postData: JSON.stringify({ outcome: "failed" }) }),
  );
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "这次支付未完成",
    paymentExpectation,
  );
  expect(
    (
      await (
        await page.request.get(`/api/assessments/${assessment.id}/result`)
      ).json()
    ).access,
  ).toBe("free");
  await page.unroute("**/api/mock-checkout/*/confirm");
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "你的完整评估", exact: true }),
  ).toBeVisible(paymentExpectation);
  expect(keys).toHaveLength(2);
  expect(keys[1]).not.toBe(keys[0]);
});

test("生活看板显示真实回答、切换维度与预测节点，付费前不泄漏计算", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "桌面设计验收");
  expect((await page.request.post("/api/sessions", { data: {} })).ok()).toBe(
    true,
  );
  const created = await page.request.post("/api/assessments", {
    data: {},
    headers: headers(),
  });
  expect(created.ok()).toBe(true);
  const a = await created.json();
  const updated = await page.request.patch(`/api/assessments/${a.id}`, {
    headers: headers(),
    data: { expectedVersion: 0, answers, resumeStepId: "review" },
  });
  expect(updated.ok()).toBe(true);
  const submitted = await page.request.post(`/api/assessments/${a.id}/submit`, {
    headers: headers(),
    data: { expectedVersion: 1 },
  });
  expect(submitted.ok()).toBe(true);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "你的身体概况", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".goal-difference")).toContainText("10 kg");
  await expect(page.locator(".goal-difference")).toContainText("13.3%");
  await expect(page.locator(".chart")).toHaveCount(0);
  await expect(page.getByText("每日摄入参考", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: /休息与精力/ }).click();
  await expect(page.locator(".dimension-evidence")).toContainText(
    "午后容易犯困",
  );
  await page.getByRole("button", { name: /饮食节奏/ }).click();
  await expect(page.locator(".dimension-evidence")).toContainText(
    "经常喝含糖饮料",
  );
  await page.getByRole("button", { name: /坚持的方式/ }).click();
  await expect(page.locator(".dimension-evidence")).toContainText(
    "晚间，忙完一天之后",
  );
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('400 16px "Noto Sans SC Variable"', "你的身体概况"),
    ),
  ).toBe(true);
  await page
    .locator(".dashboard-intro-photo img")
    .evaluate((img: HTMLImageElement) => img.decode());
  await page.screenshot({
    path: "outputs/wellnest/dashboard-free.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "查看我的完整评估", exact: true })
    .click();
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "你的完整评估", exact: true }),
  ).toBeVisible();
  const calculation = (
    await (await page.request.get(`/api/assessments/${a.id}/result`)).json()
  ).calculation;
  await expect(page.locator(".calorie-number")).toContainText(
    String(calculation.suggestedKcal),
  );
  const slider = page.getByRole("slider", { name: "查看预测节点" });
  await slider.focus();
  await slider.press("End");
  await expect(page.locator(".projection-readout")).toContainText(
    calculation.predictedGoalDate,
  );
  await expect(page.locator(".projection-readout strong")).toContainText("65");
  await page.getByRole("button", { name: /休息与精力/ }).click();
  await page.screenshot({
    path: "outputs/wellnest/dashboard-member.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByText("查看完整行动安排", { exact: true }).click();
  await expect(page.locator(".all-actions .personal-plan")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: /饮食节奏/ }).click();
  expect(
    await page
      .locator(".dimension-explanation")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
});

test("旧草稿入口开始新版，原回答保留且刷新继续新版", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "桌面入口验收");
  await page.request.post("/api/sessions", { data: {} });
  const old = await (
    await page.request.post("/api/assessments", {
      data: {},
      headers: headers(),
    })
  ).json();
  await page.request.patch(`/api/assessments/${old.id}`, {
    headers: headers(),
    data: {
      expectedVersion: 0,
      answers: { age: 35, goal: "lose" },
      resumeStepId: "sex",
    },
  });
  // Render an older questionnaire response; creation and data preservation use the real API.
  await page.route("**/api/session", async (route) => {
    const response = await route.fetch();
    const session = await response.json();
    if (session.assessment?.id === old.id)
      session.assessment.flowVersion = "wellness-v1";
    await route.fulfill({ response, json: session });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "开始新版测评" }).click();
  await expect(
    page.getByRole("heading", { name: "你希望从哪里开始？" }),
  ).toBeVisible();
  const current = (await (await page.request.get("/api/session")).json())
    .assessment;
  expect(current.id).not.toBe(old.id);
  expect(current.answers.age).toBeNull();
  expect(
    (await (await page.request.get(`/api/assessments/${old.id}`)).json())
      .answers.age,
  ).toBe(35);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "你希望从哪里开始？" }),
  ).toBeVisible();
});
