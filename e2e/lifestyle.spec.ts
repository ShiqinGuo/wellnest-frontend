import { test, expect } from "@playwright/test";
import { next, choose, fill, profileIntro } from "./helpers";

test("画像多选、条件追问、阶段恢复、修改后方案更新和付费隔离", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "新增设计验收仅桌面");
  const capture = async (name: string) => {
    await page
      .locator(".profile-photo img")
      .evaluateAll((images) =>
        Promise.all(images.map((img) => (img as HTMLImageElement).decode())),
      );
    await page.screenshot({
      path: `outputs/wellnest/lifestyle-${name}.png`,
      fullPage: true,
      animations: "disabled",
    });
  };
  await page.goto("/");
  await page.getByRole("radio", { name: "减轻体重", exact: true }).click();
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await expect(page.locator(".guided-response")).toBeVisible();
  await next(page);
  await choose(page, "女性");
  await profileIntro(page);
  await choose(page, "每周 1–2 次");
  await choose(page, "大部分时间坐着");
  const none = page.getByRole("checkbox", { name: "以上皆无", exact: true });
  const knees = page.getByRole("checkbox", {
    name: "膝盖需要留意",
    exact: true,
  });
  await knees.click();
  await none.click();
  await expect(knees).not.toBeChecked();
  await knees.click();
  await expect(none).not.toBeChecked();
  await capture("limitations");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "从你的活动起点开始" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "从你的活动起点开始" }),
  ).toBeVisible();
  await expect(page.locator(".plan-boundary")).toContainText("膝盖");
  await expect(page.locator(".plan-reason")).toContainText("坐着");
  await capture("movement");
  await next(page);
  await choose(page, "入睡和起床时间不固定");
  await choose(page, "午后容易犯困");
  await choose(page, "每天吃饭时间不太固定");
  await page
    .getByRole("checkbox", { name: "经常喝含糖饮料", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "习惯夜间加餐", exact: true })
    .click();
  await capture("food");
  await next(page);
  await choose(page, "总是没有时间");
  await expect(
    page.getByRole("heading", { name: "哪个时段更容易留给自己？" }),
  ).toBeVisible();
  await choose(page, "晚间，忙完一天之后");
  await expect(
    page.getByRole("heading", { name: "让改变融入你的日常" }),
  ).toBeVisible();
  await expect(page.locator(".personal-plan")).toContainText("晚间");
  await page.reload();
  await expect(page.locator(".personal-plan")).toContainText("常喝含糖饮料");
  await capture("habits");
  await next(page);
  await fill(page, "你现在多少岁？", "35");
  await fill(page, "你的身高是多少？", "165");
  await fill(page, "你目前的体重是多少？", "75");
  await fill(page, "你的目标体重是多少？", "65");
  await expect(
    page.getByRole("heading", { name: "你的第一站，已经选好了" }),
  ).toBeVisible();
  await next(page);
  await page.getByRole("button", { name: "修改barrier", exact: true }).click();
  await choose(page, "开始容易，坚持比较难");
  await expect(
    page.getByRole("heading", { name: "确认你的信息" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "修改time_window", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "修改food_habits", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "以上皆无", exact: true }).click();
  await next(page);
  await page.getByRole("button", { name: "查看我的评估", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "你的身体概况", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".personal-plan")).not.toContainText("晚间");
  await expect(page.locator(".personal-plan")).not.toContainText(
    "常喝含糖饮料",
  );
  await expect(page.locator(".personal-plan")).toContainText(
    "开始，却难以持续",
  );
  await expect(page.getByText("每日摄入参考", { exact: true })).toHaveCount(0);
  await capture("preview");
  const session = await page.request.get("/api/session");
  const assessment = (await session.json()).assessment;
  const free = await (
    await page.request.get(`/api/assessments/${assessment.id}/result`)
  ).json();
  expect(free.calculation).toBeUndefined();
  expect(free.planPreview.cards).toHaveLength(4);
  expect(assessment.answers.timeWindow).toBeNull();
  await page
    .getByRole("button", { name: "查看我的完整评估", exact: true })
    .click();
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(page.getByText("每日摄入参考", { exact: true })).toBeVisible();
  const member = await (
    await page.request.get(`/api/assessments/${assessment.id}/result`)
  ).json();
  expect(member.planPreview).toEqual(free.planPreview);
  expect(member.calculation.projection.length).toBeGreaterThan(0);
});
