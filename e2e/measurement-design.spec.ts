import { test, expect } from "@playwright/test";
import { next, choose, profileIntro, profileAfterActivity } from "./helpers";

for (const sex of ["female", "male"] as const) {
  test(`桌面 ${sex} 图片、数值反馈与动效`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "桌面验收");
    await page.goto("/");
    await page.getByRole("radio", { name: "减轻体重", exact: true }).click();
    await page
      .getByRole("button", { name: "开始我的测评", exact: true })
      .click();
    await expect(page.locator(".guided-response")).toBeVisible();
    await next(page);
    await choose(page, sex === "male" ? "男性" : "女性");
    await profileIntro(page);
    await expect(
      page.getByRole("heading", { name: "你多久运动一次？" }),
    ).toBeVisible();
    await expect(page.locator(".choice-photo img").first()).toHaveAttribute(
      "src",
      sex === "male" ? "/images/male-desk.webp" : "/images/desk.webp",
    );
    await choose(page, "每周 1–2 次");
    await profileAfterActivity(page);
    await expect(
      page.getByRole("heading", { name: "你现在多少岁？" }),
    ).toBeVisible();
    const photo = page.locator(".measurement-story img");
    const feedback = page.locator(".selection-response");
    const expectedPhoto =
      sex === "male" ? "/images/male-outdoors.webp" : "/images/walking.webp";
    await expect(photo).toHaveAttribute("src", expectedPhoto);
    await page.getByRole("button", { name: "35 岁", exact: true }).click();
    await expect(feedback).toContainText(
      sex === "male" ? "35 岁，从现在的习惯出发" : "35 岁，按自己的节奏",
    );
    await page.getByRole("button", { name: "40 岁", exact: true }).click();
    await expect(feedback).toContainText("40 岁");
    expect(
      await page
        .locator(".story-value")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("feedback-in");
    await photo.evaluate((el) => (el as HTMLImageElement).decode());
    await page.screenshot({
      path: `outputs/wellnest/${sex}-age-desktop.png`,
      animations: "disabled",
    });
    await next(page);
    await expect(
      page.getByRole("heading", { name: "你的身高是多少？" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "165 cm", exact: true }).click();
    await next(page);
    await expect(
      page.getByRole("heading", { name: "你目前的体重是多少？" }),
    ).toBeVisible();
    await expect(photo).toHaveAttribute("src", expectedPhoto);
    await page.getByRole("button", { name: "75 kg", exact: true }).click();
    await expect(feedback).toContainText(
      sex === "male" ? "75 kg，起点已记下" : "以 75 kg 为起点",
    );
    await page.screenshot({
      path: `outputs/wellnest/${sex}-weight-desktop.png`,
      animations: "disabled",
    });
    const bounds = await page.locator(".measurement-story").boundingBox();
    const footer = await page.locator(".action-bar").boundingBox();
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(footer!.y);
    await next(page);
    await expect(
      page.getByRole("heading", { name: "你的目标体重是多少？" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "67.5 kg", exact: true }).click();
    await expect(feedback).toContainText("7.5 kg");
    await page.screenshot({
      path: `outputs/wellnest/${sex}-target-desktop.png`,
      animations: "disabled",
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(
      await page
        .locator(".story-value")
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    await page.getByText("直接输入数值", { exact: true }).click();
    await page.getByLabel("你的目标体重是多少？", { exact: true }).fill("999");
    await expect(feedback).toContainText("先调整到支持的范围");
    await expect(
      page.getByRole("button", { name: "继续", exact: true }),
    ).toBeDisabled();
  });
}
