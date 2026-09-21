import { test, expect } from "@playwright/test";
import { next, choose, profileIntro, profileAfterActivity } from "./helpers";
test("图卡引导、反馈页恢复、无键盘填表完成和模拟支付", async ({
  page,
}, info) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "减轻体重", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("从一个小目标开始");
  // A selected choice must not silently navigate away.
  await expect(
    page.getByRole("heading", { name: "你希望从哪里开始？" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "从一个小目标开始" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "从一个小目标开始" }),
  ).toBeVisible();
  await page
    .locator(".guide-photo")
    .evaluate((img: HTMLImageElement) => img.decode());
  await page.screenshot({
    path: `outputs/wellnest/guided-goal-${info.project.name}.png`,
    fullPage: true,
  });
  await next(page);
  await choose(page, "女性");
  await profileIntro(page);
  await page.getByRole("radio", { name: "每周 1–2 次", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("你已经开始行动");
  await page.screenshot({
    path: `outputs/wellnest/guided-activity-${info.project.name}.png`,
    fullPage: true,
  });
  await next(page);
  await profileAfterActivity(page);
  await expect(
    page.getByRole("button", { name: "继续", exact: true }),
  ).toBeDisabled();
  for (const name of ["35 岁", "165 cm", "75 kg", "67.5 kg"]) {
    await page.getByRole("button", { name, exact: true }).click();
    if (name === "165 cm") {
      const slider = page.getByRole("slider");
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      await expect(slider).toHaveValue("165.1");
      await page.keyboard.press("ArrowLeft");
      await page.screenshot({
        path: `outputs/wellnest/guided-measurement-${info.project.name}.png`,
        fullPage: true,
      });
    }
    await next(page);
  }
  await expect(
    page.getByRole("heading", { name: "你的第一站，已经选好了" }),
  ).toBeVisible();
  await next(page);
  await page.getByRole("button", { name: "查看我的评估", exact: true }).click();
  await expect(page.getByText("27.55", { exact: false })).toBeVisible();
  await expect(page.getByText("每日摄入参考", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "查看我的完整评估", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: `outputs/wellnest/paywall-${info.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "模拟支付并解锁", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "你的完整评估", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("每日摄入参考", { exact: true })).toBeVisible();
  await expect(page.getByText("1689", { exact: false })).toBeVisible();
  await page.screenshot({
    path: `outputs/wellnest/member-${info.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("返回更换目标，回应同步变化且保持键盘焦点", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "减轻体重", exact: true }).click();
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "从一个小目标开始" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "返回", exact: true }).click();
  await choose(page, "稳步增重");
  await expect(
    page.getByRole("heading", { name: "一步一步，接近你的目标" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "一步一步，接近你的目标" }),
  ).toBeVisible();
});
