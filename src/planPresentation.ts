import type {
  PlanMessage,
  PlanPreview,
  BmiCategory,
  CalculationAssumption,
  ResultSummary,
} from "./generated/contract";
import { Locale } from "./i18n";
import * as zh from "./locales/plan.zh.codes";
import * as en from "./locales/plan.en.codes";

export function renderPlanMessage(
  message: PlanMessage,
  locale: Locale,
): string {
  const catalogue = locale === Locale.English ? en : zh;
  const template = catalogue.messages[message.code];
  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = message.params[name as keyof typeof message.params];
    const values = Array.isArray(value) ? value : [value];
    return values
      .map((v) => catalogue.labels[name]?.[v ?? ""] ?? "")
      .join(locale === Locale.English ? ", " : "、");
  });
}

export function presentPlan(plan: PlanPreview | null, locale: Locale) {
  if (!plan) return null;
  const render = (message: PlanMessage) => renderPlanMessage(message, locale);
  return {
    ...plan,
    cards: plan.cards.map((card) => ({
      ...card,
      title: render(card.title),
      reason: card.reason
        .map(render)
        .join(locale === Locale.English ? ", " : "，"),
      action: card.action
        .map(render)
        .join(locale === Locale.English ? " " : ""),
    })),
    preferences: plan.preferences.map(render),
    boundaries: plan.boundaries.map(render),
  };
}

export function renderResultCode(
  code: BmiCategory | CalculationAssumption | ResultSummary,
  locale: Locale,
) {
  return (locale === Locale.English ? en : zh).resultMessages[code];
}
