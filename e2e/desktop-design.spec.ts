import { test, expect } from "@playwright/test";
import { next, profileIntro } from "./helpers";

test("桌面实拍素材与减少动态效果设置", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "本轮验收范围为桌面端");
  await page.goto("/");
  await expect(
    page.getByRole("radio", { name: "减轻体重", exact: true }),
  ).toBeEnabled();
  const photos = page.locator(".choice-photo img");
  await expect(photos).toHaveCount(3);
  await photos.evaluateAll((imgs) =>
    Promise.all(imgs.map((img) => (img as HTMLImageElement).decode())),
  );
  await expect(page.locator(".choice-art")).toHaveCount(0);
  await page.screenshot({
    path: "outputs/wellnest/photo-welcome-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("radio", { name: "减轻体重", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("从一个小目标开始");
  expect(
    await page
      .getByRole("status")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("feedback-in");
  await page.getByRole("button", { name: "开始我的测评", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "从一个小目标开始" }),
  ).toBeVisible();
  await next(page);
  await page.getByRole("radio", { name: "女性", exact: true }).click();
  await next(page);
  await profileIntro(page);
  await expect(
    page.getByRole("heading", { name: "你多久运动一次？" }),
  ).toBeVisible();
  await photos.evaluateAll((imgs) =>
    Promise.all(imgs.map((img) => (img as HTMLImageElement).decode())),
  );
  await page.getByRole("radio", { name: "每周 1–2 次", exact: true }).click();
  await page.screenshot({
    path: "outputs/wellnest/photo-activity-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  const footer = await page.locator(".action-bar").boundingBox();
  for (const radio of await page.getByRole("radio").all()) {
    const bounds = await radio.boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(footer!.y);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("radio", { name: "每周 3–4 次", exact: true }).click();
  expect(
    await page
      .getByRole("status")
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe("none");
  await next(page);
  await expect(
    page.getByRole("heading", { name: "不运动的时候，你的一天是怎样的？" }),
  ).toBeFocused();
});
