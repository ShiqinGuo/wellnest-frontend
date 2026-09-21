import { presentPlan } from "../planPresentation";
import { useI18n } from "../i18n";
import type { PlanPreview, PlanFocus } from "../generated/contract";
export function PersonalPlan({
  plan: rawPlan,
  stage,
  focus,
}: {
  plan: PlanPreview | null;
  stage?: "movement" | "habits";
  focus?: PlanFocus | null;
}) {
  const { t, locale } = useI18n();
  const plan = presentPlan(rawPlan, locale);
  if (!plan) return null;
  const focusTopic = focus
    ? {
        movement_habit: "movement",
        meal_routine: "meals",
        consistency: "consistency",
        insufficient_context: "",
      }[focus]
    : "";
  const cards = plan.cards.filter((c) =>
    stage === "movement"
      ? c.topic === "movement"
      : stage === "habits"
        ? c.topic !== "movement"
        : true,
  );
  return (
    <div className="personal-plan">
      {!stage && (
        <>
          <span className="eyebrow">{t("从你的生活出发")}</span>
          <h2>{t("你的第一步行动安排")}</h2>
        </>
      )}
      {plan.preferences.length > 0 && (
        <p className="plan-preferences">
          {t("你在意的是：")}
          {plan.preferences.join(" · ")}
        </p>
      )}
      <div className="personal-plan-grid">
        {cards.map((card, i) => (
          <article key={card.topic} className="personal-plan-card">
            <span className="plan-number">0{i + 1}</span>
            <h3>{card.title}</h3>
            {card.topic === focusTopic && (
              <span className="focus-label">{t("建议先从这里开始")}</span>
            )}
            <p className="plan-reason">{card.reason}</p>
            <p>{card.action}</p>
          </article>
        ))}
      </div>
      {plan.boundaries.map((boundary) => (
        <p className="plan-boundary" key={boundary}>
          {boundary}
        </p>
      ))}
    </div>
  );
}
