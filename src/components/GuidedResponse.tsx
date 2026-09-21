import { useI18n } from "../i18n";
import type { Answers, Step } from "../generated/contract";
import { choicePhotoFor } from "../imagery";
import { labels, feedbackForChoice } from "../flow";
import { ChoicePhoto } from "./ChoicePhoto";

export const guidanceSteps: Step[] = [
  "goal_feedback",
  "activity_feedback",
  "target_feedback",
];
export function GuidedResponse({
  step,
  answers,
  busy,
  disabled,
  onContinue,
}: {
  step: Step;
  answers: Answers;
  busy: boolean;
  disabled: boolean;
  onContinue: () => void;
}) {
  const { t } = useI18n();
  const goal = answers.goal ?? "maintain";
  const activity = answers.activity ?? "low";
  const isGoal = step === "goal_feedback";
  const isActivity = step === "activity_feedback";
  const title = isGoal
    ? {
        lose: "从一个小目标开始",
        maintain: "把好状态留在日常里",
        gain: "一步一步，接近你的目标",
      }[goal]
    : isActivity
      ? {
          low: "从你现在的节奏出发",
          light: "让已经开始的改变继续",
          moderate: "找到适合你的补给节奏",
          high: "行动与恢复，都值得关注",
        }[activity]
      : goal === "maintain"
        ? "把重点放在保持状态上"
        : "你的第一站，已经选好了";
  return (
    <section className="guided-response">
      <div className="guide-copy">
        <span className="eyebrow">
          {t(
            isGoal
              ? `你的目标 · ${labels[goal]}`
              : isActivity
                ? `你的节奏 · ${labels[activity]}`
                : "离完成只差一步",
          )}
        </span>
        <h1 tabIndex={-1}>{t(title)}</h1>
        <p>
          {t(
            isGoal
              ? {
                  lose: "先了解你现在的习惯，再找到适合你的起点。",
                  maintain: "看看日常活动，让评估贴近你现在的生活。",
                  gain: "了解你的活动量，再结合身体数据估算摄入参考。",
                }[goal]
              : isActivity
                ? feedbackForChoice(activity, answers.sex)
                : goal === "maintain"
                  ? "这次以维持当前体重为目标，不需要再设一个更低的数字。"
                  : answers.sex === "male"
                    ? "起点和目标都已记下。先坚持日常行动，再按实际感受调整。"
                    : "目标可以分阶段调整，日常的持续行动比赶进度更重要。",
          )}
        </p>
        {!isGoal && !isActivity && (
          <div className="target-journey">
            <span>
              {answers.weightKg}
              <small>{t("kg · 现在")}</small>
            </span>
            <span aria-hidden="true">→</span>
            <strong>
              {answers.targetWeightKg}
              <small>{t("kg · 目标")}</small>
            </strong>
          </div>
        )}
        <div className="guide-next">
          <span>{t("接下来")}</span>
          <p>
            {t(
              isGoal
                ? "了解你的运动习惯"
                : isActivity
                  ? "用年龄、身高和体重，看看你的身体概况"
                  : "确认信息，查看你的评估",
            )}
          </p>
        </div>
      </div>
      {isActivity ? (
        <div className="guide-art">
          <ChoicePhoto kind={activity} sex={answers.sex} />
        </div>
      ) : (
        <img
          className="guide-photo"
          src={choicePhotoFor(goal, answers.sex).src}
          style={{ objectPosition: choicePhotoFor(goal, answers.sex).position }}
          alt={t("日常运动场景")}
        />
      )}
      <div className="action-bar">
        <button className="primary" disabled={disabled} onClick={onContinue}>
          {t(busy ? "保存中…" : "继续")}
        </button>
      </div>
    </section>
  );
}
