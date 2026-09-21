import { test, expect } from "@playwright/test";

import {
  next,
  choose,
  fill,
  begin,
  profileIntro,
  profileAfterActivity,
} from "./helpers";

test("维持目标跳步、确认页修改回跳、单点图和弹窗键盘", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(
    page.getByRole("radio", { name: "维持状态", exact: true }),
  ).toBeEnabled();
  await page.screenshot({
    path: `outputs/wellnest/welcome-${info.project.name}.png`,
    fullPage: true,
  });
  await begin(page, "维持状态");
  await fill(page, "你现在多少岁？", "40");
  await fill(page, "你的身高是多少？", "180");
  await fill(page, "你目前的体重是多少？", "80");
  await expect(
    page.getByRole("heading", { name: "把重点放在保持状态上" }),
  ).toBeVisible();
  await next(page);
  await expect(
    page.getByRole("button", { name: "修改target", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "修改age", exact: true }).click();
  await fill(page, "你现在多少岁？", "41");
  await expect(
    page.getByRole("heading", { name: "确认你的信息" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "查看我的评估", exact: true }).click();
  const open = page.getByRole("button", {
    name: "查看我的完整评估",
    exact: true,
  });
  await open.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "关闭", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(
    page.getByText("维持当前体重，关注长期趋势。", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".chart circle")).toHaveCount(1);
});

test("增重动态边界与修改依赖字段后补齐目标", async ({ page }) => {
  await begin(page, "稳步增重");
  await fill(page, "你现在多少岁？", "40");
  await fill(page, "你的身高是多少？", "180");
  await fill(page, "你目前的体重是多少？", "80");
  await expect(
    page.getByRole("heading", { name: "你的目标体重是多少？", exact: true }),
  ).toBeVisible();
  const target = page.getByLabel("你的目标体重是多少？", { exact: true });
  await page.getByText("直接输入数值", { exact: true }).click();
  await target.fill("79");
  await expect(
    page.getByRole("button", { name: "继续", exact: true }),
  ).toBeDisabled();
  await expect(target).toHaveAttribute("max", "100");
  await target.fill("85");
  await next(page);
  await next(page);
  await page.getByRole("button", { name: "修改weight", exact: true }).click();
  await fill(page, "你目前的体重是多少？", "81");
  await expect(
    page.getByRole("heading", { name: "你的目标体重是多少？" }),
  ).toBeVisible();
  await fill(page, "你的目标体重是多少？", "85");
  await expect(
    page.getByRole("heading", { name: "确认你的信息" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "查看我的评估", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "你的身体概况" }),
  ).toBeVisible();
});

test("两个页面并发编辑时显式载入最新进度", async ({ page, context }) => {
  await begin(page, "减轻体重");
  const other = await context.newPage();
  await other.goto("/");
  await expect(
    other.getByRole("heading", { name: "你现在多少岁？", exact: true }),
  ).toBeVisible();
  await fill(other, "你现在多少岁？", "37");
  await fill(page, "你现在多少岁？", "35");
  await page.getByRole("button", { name: "载入最新进度", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "你的身高是多少？", exact: true }),
  ).toBeVisible();
  const session = await (await page.request.get("/api/session")).json();
  expect(session.assessment.answers.age).toBe(37);
  await other.close();
});

test("保存与支付已提交但响应丢失时复用原操作键", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "维持状态", exact: true }).click();
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await next(page);
  const keys: string[] = [];
  await expect(
    page.getByRole("heading", { name: "你的性别是？", exact: true }),
  ).toBeVisible();
  let lost = false;
  await page.route("**/api/assessments/*", async (route) => {
    if (route.request().method() !== "PATCH") return route.continue();
    keys.push(route.request().headers()["idempotency-key"]);
    const response = await route.fetch();
    if (!lost) {
      lost = true;
      await route.abort("failed");
    } else await route.fulfill({ response });
  });
  await choose(page, "女性");
  await expect(page.getByRole("alert")).toBeVisible();
  await next(page);
  await expect(
    page.getByRole("heading", { name: "除了体重，你还希望改善什么？" }),
  ).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  await page.unroute("**/api/assessments/*");
  await profileIntro(page);
  await choose(page, "每周 1–2 次");
  await profileAfterActivity(page);
  await fill(page, "你现在多少岁？", "35");
  await fill(page, "你的身高是多少？", "165");
  await fill(page, "你目前的体重是多少？", "65");
  await next(page);
  await page.getByRole("button", { name: "查看我的评估", exact: true }).click();
  await page
    .getByRole("button", { name: "查看我的完整评估", exact: true })
    .click();
  const payKeys: string[] = [];
  await page.route("**/api/payments", async (route) => {
    payKeys.push(route.request().headers()["idempotency-key"]);
    const response = await route.fetch();
    if (payKeys.length === 1) await route.abort("failed");
    else await route.fulfill({ response });
  });
  const pay = page.getByRole("button", { name: "模拟支付并解锁", exact: true });
  await pay.click();
  await expect(page.getByRole("dialog").getByRole("alert")).toBeVisible();
  await pay.click();
  await expect(
    page.getByRole("heading", { name: "你的完整评估" }),
  ).toBeVisible();
  expect(payKeys).toHaveLength(2);
  expect(payKeys[0]).toBe(payKeys[1]);
  await page.unrouteAll({ behavior: "wait" });
});
