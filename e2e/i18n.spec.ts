import { test, expect } from "@playwright/test";
import { paymentExpectation } from "./helpers";
import { readFileSync, readdirSync } from "node:fs";
import ts from "typescript";
import { renderPlanMessage, renderResultCode } from "../src/planPresentation";
import type {
  PlanMessage,
  BmiCategory,
  CalculationAssumption,
} from "../src/generated/contract";
import { Locale, translate } from "../src/i18n";

test("服务端各行动规则分支都有英文呈现", async ({}, info) => {
  test.skip(info.project.name !== "desktop", "翻译契约检查只运行一次");
  const fixture: {
    messages: PlanMessage[];
    resultCodes: (BmiCategory | CalculationAssumption)[];
  } = JSON.parse(readFileSync("src/generated/plan-fixtures.json", "utf8"));
  expect(fixture.messages.length).toBeGreaterThan(70);
  for (const message of fixture.messages) {
    const english = renderPlanMessage(message, Locale.English);
    const chinese = renderPlanMessage(message, Locale.Chinese);
    expect(english).toBeTruthy();
    expect(english).not.toMatch(/[\u4e00-\u9fff]|\{\w+\}/);
    expect(chinese).toMatch(/[\u4e00-\u9fff]/);
    expect(chinese).not.toMatch(/\{\w+\}/);
  }
  for (const code of fixture.resultCodes) {
    expect(renderResultCode(code, Locale.English)).not.toMatch(
      /[\u4e00-\u9fff]/,
    );
    expect(renderResultCode(code, Locale.Chinese)).toMatch(/[\u4e00-\u9fff]/);
  }
});

test("中英文文案目录覆盖所有静态界面文字", async ({}, info) => {
  test.skip(info.project.name !== "desktop", "目录检查只运行一次");
  const internalFragments = new Set(["经常", "习惯", "喜欢"]);
  const missing = new Set<string>();
  for (const dir of ["src", "src/components"])
    for (const name of readdirSync(dir)) {
      if (!/\.tsx?$/.test(name) || name === "i18n.tsx") continue;
      const file = ts.createSourceFile(
        name,
        readFileSync(`${dir}/${name}`, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        name.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      function visit(node: ts.Node) {
        if (
          (ts.isStringLiteral(node) || ts.isJsxText(node)) &&
          /[\u4e00-\u9fff]/.test(node.text)
        ) {
          const text = node.text.replace(/\s+/g, " ").trim();
          if (
            !internalFragments.has(text) &&
            /[\u4e00-\u9fff]/.test(translate(text, Locale.English))
          )
            missing.add(text);
        }
        ts.forEachChild(node, visit);
      }
      visit(file);
    }
  expect([...missing]).toEqual([]);
});

test("英文完整测评、切换保留进度、动态建议与支付结果均本地化", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "英文桌面验收");
  const englishOnly = async () => {
    const text = await page.locator("main").innerText();
    expect(text.match(/[\u4e00-\u9fff]+/g), text).toBeNull();
  };
  const next = async () => {
    await englishOnly();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  };
  const choose = async (name: string, multi = false) => {
    await page
      .getByRole(multi ? "checkbox" : "radio", { name, exact: true })
      .click();
    await next();
  };
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("radio", { name: "Lose weight", exact: true }).click();
  await page
    .getByRole("button", { name: "Start my assessment", exact: true })
    .click();
  await next();
  await choose("Female");
  await choose("More everyday energy", true);
  await choose("Just starting, without a routine");
  await choose("1–2 times a week");
  await choose("Mostly sitting");
  await choose("I need to be mindful of my knees", true);
  await next();
  await choose("My sleep and wake times vary");
  await page
    .getByRole("radio", {
      name: "I tend to feel sleepy in the afternoon",
      exact: true,
    })
    .click();
  await next();
  await page
    .getByRole("radio", {
      name: "My meal times vary from day to day",
      exact: true,
    })
    .click();
  await next();
  await page
    .getByRole("checkbox", { name: "I often have sugary drinks", exact: true })
    .click();
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator(".profile-photo img")
    .evaluate((img: HTMLImageElement) => img.decode());
  const photo = await page.locator(".profile-photo").boundingBox();
  const footer = await page.locator(".action-bar").boundingBox();
  expect(photo!.y + photo!.height).toBeLessThanOrEqual(footer!.y);
  await page.screenshot({
    path: "outputs/wellnest/question-english.png",
    animations: "disabled",
  });
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "经常喝含糖饮料", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("checkbox", {
      name: "I often have sugary drinks",
      exact: true,
    }),
  ).toBeChecked();
  await next();
  await expect(
    page.getByRole("heading", {
      name: "What makes it hardest to stay consistent?",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await choose("I never seem to have enough time");
  await choose("Evening, after the day's demands");
  await next();
  for (const name of ["35 years", "165 cm", "75 kg", "67.5 kg"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await next();
  }
  await next();
  await englishOnly();
  await page
    .getByRole("button", { name: "See my assessment", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your body overview" }),
  ).toBeVisible();
  await englishOnly();
  await page
    .getByRole("button", { name: "See my full assessment", exact: true })
    .click();
  expect(
    (await page.getByRole("dialog").innerText()).match(/[\u4e00-\u9fff]+/g),
  ).toBeNull();
  await page
    .getByRole("button", { name: "Simulate payment & unlock", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your full assessment" }),
  ).toBeVisible(paymentExpectation);
  await page
    .getByText("Explore all your starting steps", { exact: true })
    .click();
  await page
    .getByText("How should I read these numbers?", { exact: true })
    .click();
  await englishOnly();
  await expect(page.locator(".calorie-number")).toContainText("1,689");
  const session = (await (await page.request.get("/api/session")).json())
    .assessment;
  const result = await (
    await page.request.get(`/api/assessments/${session.id}/result`)
  ).json();
  await expect(page.locator(".projection-readout")).toContainText(
    translate(result.calculation.projection[0].date, Locale.English),
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "outputs/wellnest/dashboard-english.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const before = (await (await page.request.get("/api/session")).json())
    .assessment;
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "你的完整评估" }),
  ).toBeVisible();
  const after = (await (await page.request.get("/api/session")).json())
    .assessment;
  expect(after).toEqual(before);
});

test("英文错误可读且切回中文立即更新", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "语言错误态验收");
  await page.route("**/api/session", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "SESSION_EXPIRED", message: "会话已过期" },
      }),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Your session has expired",
  );
  await expect(
    page.getByRole("button", { name: "Reconnect", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("会话已过期");
});
