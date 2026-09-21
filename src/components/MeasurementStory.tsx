import { useI18n } from "../i18n";
import { choicePhotoFor } from "../imagery";
import { labels } from "../flow";
import type { Answers, Step } from "../generated/contract";

export const storySteps: Step[] = ["age", "weight", "target"];
export function measurementFeedback(
  step: Step,
  value: string,
  valid: boolean,
  answers?: Answers,
) {
  if (!valid)
    return value
      ? "先调整到支持的范围，再继续。"
      : "选择符合现在的你的数值，我们从这里开始。";
  const male = answers?.sex === "male";
  if (step === "age")
    return male
      ? `${value} 岁，从现在的习惯出发。${labels[answers?.activity ?? "low"]}，这个节奏也记下了。`
      : `${value} 岁，按自己的节奏${answers?.goal === "maintain" ? "保持好状态" : "开始改变"}。不必和别人比较。`;
  if (step === "weight") {
    if (answers?.goal === "maintain")
      return male
        ? `${value} kg，保持这个起点。接下来一起确认你的日常节奏。`
        : `${value} kg，就是这次的维持目标。接下来确认你的信息。`;
    return male
      ? `${value} kg，起点已记下。接下来设定你的${answers?.goal === "gain" ? "增重" : "减重"}阶段目标。`
      : `以 ${value} kg 为起点，下一步选一个${answers?.goal === "gain" ? "更高" : "更低"}一点的阶段目标。`;
  }
  const difference = Math.abs(
    Number(value) - (answers?.weightKg ?? Number(value)),
  );
  return male
    ? `${value} kg，和现在相差 ${Number(difference.toFixed(1))} kg。把它作为第一站，按自己的节奏前进。`
    : `从 ${answers?.weightKg} kg 到 ${value} kg，先把这 ${Number(difference.toFixed(1))} kg 作为一个阶段。`;
}
export function MeasurementStory({
  step,
  value,
  valid,
  answers,
}: {
  step: Step;
  value: string;
  valid: boolean;
  answers?: Answers;
}) {
  const { t } = useI18n();
  const photo = choicePhotoFor(
    step === "age"
      ? (answers?.activity ?? "light")
      : (answers?.goal ?? "maintain"),
    answers?.sex,
  );
  return (
    <figure className={`measurement-story ${valid ? "has-selection" : ""}`}>
      <img
        src={photo.src}
        alt={t(step === "age" ? "按自己的节奏享受日常活动" : "日常运动场景")}
        style={{ objectPosition: photo.position }}
        width="1100"
        height="800"
      />
      <figcaption>
        <span>
          {t(
            step === "age"
              ? "你的节奏，值得被尊重"
              : step === "target"
                ? "一步一步，接近目标"
                : "改变，从了解自己开始",
          )}
        </span>
        <strong
          key={valid ? value : "empty"}
          className="story-value"
          aria-hidden="true"
        >
          {t(
            step === "age"
              ? "每个阶段，都可以开始"
              : step === "target"
                ? "你的目标，你的节奏"
                : "这是起点，不是标签",
          )}
        </strong>
        <small>
          {t(
            step === "age"
              ? labels[answers?.activity ?? "low"]
              : labels[answers?.goal ?? "maintain"],
          )}
        </small>
      </figcaption>
    </figure>
  );
}
