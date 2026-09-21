import { useI18n } from "../i18n";
import type { Guidance, PlanFocus } from "../generated/contract";
import { gradualEffortThreshold } from "../generated/contract";

const habits: Record<PlanFocus, { title: string; actions: readonly string[] }> =
  {
    movement_habit: {
      title: "从规律运动开始",
      actions: [
        "选择一种你愿意重复的轻松活动",
        "为它留出固定的时间",
        "记录感受，再调整节奏",
      ],
    },
    meal_routine: {
      title: "建立规律饮食",
      actions: [
        "先观察自己每天的用餐节奏",
        "提前安排下一次用餐",
        "回顾饥饱感与精力变化",
      ],
    },
    consistency: {
      title: "保持现在的好习惯",
      actions: [
        "保留已经容易坚持的习惯",
        "留意身体状态的变化",
        "定期回顾，而非只看单次体重",
      ],
    },
    insufficient_context: { title: "", actions: [] },
  };

export function GuidanceCard({ guidance }: { guidance: Guidance | null }) {
  const { t } = useI18n();
  if (guidance?.status !== "ready" || !guidance.focus) return null;
  const habit = habits[guidance.focus];
  return (
    <div className="plan-focus">
      <span>{t("你的行动重点")}</span>
      <strong>{t(habit.title)}</strong>
      <ul>
        {habit.actions.map((action) => (
          <li key={action}>{t(action)}</li>
        ))}
      </ul>
      {guidance.effortScore != null &&
        guidance.effortScore >= gradualEffortThreshold && (
          <p>{t("先选一个小改变，稳定后再增加。")}</p>
        )}
    </div>
  );
}
