import { expect, type Page } from "@playwright/test";
// Live payment traverses queue creation, provider confirmation, webhook and result reload.
// Keep normal UI assertions fast; give only this asynchronous boundary its own budget.
export const paymentExpectation = {
  timeout: process.env.E2E_BASE_URL ? 45_000 : 15_000,
};
export async function next(page: Page) {
  await page.getByRole("button", { name: "继续", exact: true }).click();
}
export async function choose(page: Page, name: string) {
  await page.getByRole("radio", { name, exact: true }).click();
  await next(page);
}
export async function fill(page: Page, name: string, value: string) {
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.getByText("直接输入数值", { exact: true }).click();
  await page.getByLabel(name, { exact: true }).fill(value);
  await next(page);
}
export async function begin(page: Page, goal: string) {
  await page.goto("/");
  await page.getByRole("radio", { name: goal, exact: true }).click();
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await expect(page.locator(".guided-response")).toBeVisible();
  await next(page);
  await choose(page, "男性");
  await profileIntro(page);
  await choose(page, "每周 3–4 次");
  await profileAfterActivity(page);
}
export async function profileIntro(page: Page) {
  await expect(
    page.getByRole("heading", { name: "除了体重，你还希望改善什么？" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "日常更有精神", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "建立稳定习惯", exact: true })
    .click();
  await next(page);
  await choose(page, "刚开始，还没有规律");
}
export async function profileAfterActivity(page: Page) {
  await choose(page, "大部分时间坐着");
  await page.getByRole("checkbox", { name: "以上皆无", exact: true }).click();
  await next(page);
  await expect(
    page.getByRole("heading", { name: "从你的活动起点开始" }),
  ).toBeVisible();
  await next(page);
  await choose(page, "入睡和起床时间不固定");
  await choose(page, "午后容易犯困");
  await choose(page, "每天吃饭时间不太固定");
  await page
    .getByRole("checkbox", { name: "经常喝含糖饮料", exact: true })
    .click();
  await next(page);
  await choose(page, "总是没有时间");
  await choose(page, "晚间，忙完一天之后");
  await expect(
    page.getByRole("heading", { name: "让改变融入你的日常" }),
  ).toBeVisible();
  await next(page);
  await expect(
    page.getByRole("heading", { name: "你现在多少岁？" }),
  ).toBeVisible();
}
