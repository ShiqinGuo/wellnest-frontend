import { profileQuestions, profileLabels } from "./profile";
import {
  inputRules,
  cmPerMetre,
  flowSteps,
  guidedFlowVersion,
  lifestyleFlowVersion,
  fields,
  type Answers,
  type Sex,
  type Step,
} from "./generated/contract";
export { fields };
export const measurementIncrement = 0.1;
export const stageForStep: Record<Step, string> = {
  secondary_goals: "你的期待",
  experience: "活动起点",
  daily_activity: "活动起点",
  limitations: "活动起点",
  movement_feedback: "活动起点",
  sleep: "生活与习惯",
  energy: "生活与习惯",
  meal_rhythm: "生活与习惯",
  food_habits: "生活与习惯",
  barrier: "生活与习惯",
  time_window: "生活与习惯",
  habits_feedback: "生活与习惯",
  welcome: "",
  goal_feedback: "你的目标",
  activity_feedback: "你的节奏",
  target_feedback: "你的下一步",
  sex: "关于你",
  goal: "关于你",
  age: "身体数据",
  height: "身体数据",
  weight: "身体数据",
  target: "身体数据",
  activity: "你的节奏",
  review: "即将完成",
  result: "",
};
export const guidedFlow = guidedFlowVersion;
export const currentFlow = lifestyleFlowVersion;
export function visibleSteps(
  answers?: Answers,
  version: string = currentFlow,
): Step[] {
  const steps =
    flowSteps[version as keyof typeof flowSteps] ?? flowSteps[currentFlow];
  return steps.filter(
    (step) =>
      (step !== "target" || answers?.goal !== "maintain") &&
      (step !== "time_window" || answers?.barrier === "time"),
  );
}
export function firstMissing(
  answers: Answers,
  version: string = currentFlow,
): Step {
  return (
    visibleSteps(answers, version).find(
      (step) =>
        step in fields && answers[fields[step as keyof typeof fields]] == null,
    ) ?? "review"
  );
}
export const labels: Record<string, string> = {
  ...profileLabels,
  female: "女性",
  male: "男性",
  lose: "减轻体重",
  maintain: "维持状态",
  gain: "稳步增重",
  low: "很少专门运动",
  light: "每周 1–2 次",
  moderate: "每周 3–4 次",
  high: "每周 5 次及以上",
};
const baseQuestions: Record<
  string,
  {
    title: string;
    multi?: boolean;
    options?: string[];
    unit?: string;
    min?: number;
    max?: number;
  }
> = {
  ...(profileQuestions as Record<
    string,
    { title: string; options: string[]; multi?: boolean }
  >),
  sex: {
    title: "你的性别是？",
    options: ["female", "male"],
  },
  goal: {
    title: "你的主要目标是什么？",
    options: ["lose", "maintain", "gain"],
  },
  age: {
    title: "你现在多少岁？",
    unit: "岁",
    min: inputRules.ageMin,
    max: inputRules.ageMax,
  },
  height: {
    title: "你的身高是多少？",
    unit: "cm",
    min: inputRules.heightMinCm,
    max: inputRules.heightMaxCm,
  },
  weight: {
    title: "你目前的体重是多少？",
    unit: "kg",
    min: inputRules.weightMinKg,
    max: inputRules.weightMaxKg,
  },
  target: {
    title: "你的目标体重是多少？",
    unit: "kg",
    min: inputRules.weightMinKg,
    max: inputRules.weightMaxKg,
  },
  activity: {
    title: "你多久运动一次？",
    options: ["low", "light", "moderate", "high"],
  },
};

export function questions(answers?: Answers) {
  const target = { ...baseQuestions.target };
  const weight = { ...baseQuestions.weight };
  if (answers?.goal === "maintain" && answers.heightCm) {
    const squaredHeight = (answers.heightCm / cmPerMetre) ** 2;
    weight.min = Number(
      (
        Math.ceil(
          Math.max(
            inputRules.weightMinKg,
            squaredHeight * inputRules.targetBmiMin,
          ) / measurementIncrement,
        ) * measurementIncrement
      ).toFixed(1),
    );
    weight.max = Number(
      (
        Math.floor(
          Math.min(
            inputRules.weightMaxKg,
            squaredHeight * inputRules.targetBmiMax,
          ) / measurementIncrement,
        ) * measurementIncrement
      ).toFixed(1),
    );
  }
  if (answers?.heightCm && answers?.weightKg) {
    const squaredHeight = (answers.heightCm / cmPerMetre) ** 2;
    let min = Math.max(
      inputRules.weightMinKg,
      answers.weightKg * (1 - inputRules.maxTargetChangeRatio),
      squaredHeight * inputRules.targetBmiMin,
    );
    let max = Math.min(
      inputRules.weightMaxKg,
      answers.weightKg * (1 + inputRules.maxTargetChangeRatio),
      squaredHeight * inputRules.targetBmiMax,
    );
    if (answers.goal === "lose")
      max = Math.min(max, answers.weightKg - measurementIncrement);
    if (answers.goal === "gain")
      min = Math.max(min, answers.weightKg + measurementIncrement);
    target.min = Math.ceil(min / measurementIncrement) * measurementIncrement;
    target.max = Math.floor(max / measurementIncrement) * measurementIncrement;
    target.min = Number(target.min.toFixed(1));
    target.max = Number(target.max.toFixed(1));
  }
  return { ...baseQuestions, target, weight } as typeof baseQuestions;
}

// UI suggestions are choices, never prefilled answers or clinical recommendations.
export const measurementChoices: Record<string, number[]> = {
  age: [20, 25, 30, 35, 40, 45, 50, 60],
  height: [155, 160, 165, 170, 175, 180, 185, 190],
  weight: [50, 55, 60, 65, 70, 75, 80, 90],
};
export const targetChoiceRatios = [0.05, 0.1, 0.15] as const;
export const selectionFeedback: Record<string, string> = {
  female: "记下了，这会用于估算你的基础能量需求。",
  male: "记下了，这会用于估算你的基础能量需求。",
  lose: "从一个小目标开始，不必一次改变所有习惯。",
  maintain: "保持喜欢的状态，也值得有自己的节奏。",
  gain: "循序渐进，把目标拆成可以坚持的小步。",
  low: "没关系，从日常多动一点开始。",
  light: "你已经开始行动，可以从熟悉的节奏继续。",
  moderate: "这个频率记下了。再看看运动以外，你的一天是怎样的。",
  high: "运动已经是生活的一部分，也别忘了休息。",
};

// Editorial variants only; health calculations remain server-side.
const maleSelectionFeedback: Record<string, string> = {
  male: "记下了。接下来，从你平时的活动量开始。",
  lose: "先找到自己的起点，再选一个能坚持的阶段目标。",
  maintain: "把现在的好习惯留下来，让日常节奏更稳定。",
  gain: "从当前体重出发，一步步设定你的增重目标。",
  low: "从现在的日常出发，一点点增加活动就好。",
  light: "每周已经有行动，先把这个节奏稳定下来。",
  moderate: "每周 3–4 次，记下了。接下来看看工作和生活里的活动。",
  high: "你已经有规律地运动，把恢复也留在日程里。",
};
export function feedbackForChoice(value: string, sex?: Sex | null) {
  return (
    (value === "male" || sex === "male"
      ? maleSelectionFeedback[value]
      : undefined) ?? selectionFeedback[value]
  );
}
