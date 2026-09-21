import type { Step } from "./generated/contract";

export type ProfileQuestion = {
  title: string;
  options: string[];
  multi?: boolean;
  scene: "movement" | "desk" | "sleep" | "food" | "daylight";
  caption: string;
};
export const profileQuestions: Partial<Record<Step, ProfileQuestion>> = {
  secondary_goals: {
    title: "除了体重，你还希望改善什么？",
    options: ["energy", "mobility", "routine", "strength"],
    multi: true,
    scene: "movement",
    caption: "你想要的改变，不止一个数字",
  },
  experience: {
    title: "你现在的运动经验是？",
    options: ["beginner", "returning", "regular"],
    scene: "movement",
    caption: "从真实的起点出发",
  },
  daily_activity: {
    title: "不运动的时候，你的一天是怎样的？",
    options: ["seated", "mixed", "on_feet"],
    scene: "desk",
    caption: "日常活动，也值得被看见",
  },
  limitations: {
    title: "活动时，有哪些部位需要留意？",
    options: ["back", "knees", "none"],
    multi: true,
    scene: "movement",
    caption: "舒适，是开始的前提",
  },
  sleep: {
    title: "最近，你通常睡得怎么样？",
    options: ["short", "variable", "rested"],
    scene: "sleep",
    caption: "休息，也是日常的一部分",
  },
  energy: {
    title: "一天里，你的精力通常怎样？",
    options: ["low_energy", "afternoon_dip", "steady"],
    scene: "daylight",
    caption: "留意身体自己的节奏",
  },
  meal_rhythm: {
    title: "你的日常用餐节奏是？",
    options: ["regular_meals", "skipped_meals", "irregular_meals"],
    scene: "food",
    caption: "先了解习惯，再找到小改变",
  },
  food_habits: {
    title: "这些饮食习惯，哪些比较像你？",
    options: ["late_snacks", "sweet_drinks", "sweets", "none"],
    multi: true,
    scene: "food",
    caption: "不用一次改变所有习惯",
  },
  barrier: {
    title: "你觉得最难坚持的原因是？",
    options: ["time", "motivation", "unsure", "no_barrier"],
    scene: "daylight",
    caption: "让安排适应你的生活",
  },
  time_window: {
    title: "哪个时段更容易留给自己？",
    options: ["morning", "midday", "evening", "varies"],
    scene: "daylight",
    caption: "找到生活里的一小段空档",
  },
};
export const profileLabels: Record<string, string> = {
  energy: "日常更有精神",
  mobility: "活动更自在",
  routine: "建立稳定习惯",
  strength: "积累力量",
  beginner: "刚开始，还没有规律",
  returning: "以前练过，准备重新开始",
  regular: "已经有规律运动的经验",
  seated: "大部分时间坐着",
  mixed: "坐着工作，也会起身活动",
  on_feet: "大部分时间站立或走动",
  back: "背部容易不舒服",
  knees: "膝盖需要留意",
  none: "以上皆无",
  short: "经常觉得没睡够",
  variable: "入睡和起床时间不固定",
  rested: "通常睡够，醒来有精神",
  low_energy: "白天经常觉得疲惫",
  afternoon_dip: "午后容易犯困",
  steady: "大部分时间比较稳定",
  regular_meals: "三餐时间比较规律",
  skipped_meals: "忙起来会跳过一餐",
  irregular_meals: "每天吃饭时间不太固定",
  late_snacks: "习惯夜间加餐",
  sweet_drinks: "经常喝含糖饮料",
  sweets: "喜欢吃甜食",
  time: "总是没有时间",
  motivation: "开始容易，坚持比较难",
  unsure: "不知道该从哪里开始",
  no_barrier: "暂时没有明显困难",
  morning: "早晨，开始一天之前",
  midday: "午间，短暂休息的时候",
  evening: "晚间，忙完一天之后",
  varies: "每天不固定，灵活安排",
};
export const profileFeedback: Record<string, string> = {
  energy: "记下了，我们也会了解你的睡眠与白天精力。",
  mobility: "活动自如是你的关注点，接下来看看经验与身体感受。",
  routine: "稳定的日常，就是一个值得开始的目标。",
  strength: "记下你的力量目标，先了解你现在的活动起点。",
  beginner: "从容易重复的活动开始，不必急着追上别人的进度。",
  returning: "可以从熟悉的活动重新开始，不必马上回到过去的强度。",
  regular: "已有的经验会留下来，我们继续看看运动以外的日常。",
  seated: "运动和久坐可以同时存在，日常起身活动会单独考虑。",
  mixed: "记下你的活动间歇，接下来看看哪些安排最适合保留。",
  on_feet: "你的日常已经有不少活动，也给恢复留出空间。",
  back: "先以舒服为准，不需要勉强完成让背部不适的动作。",
  knees: "膝盖舒服更重要，不用勉强跟上别人的强度。",
  none: "记下了，继续按你现在的情况来。",
  short: "先了解你的休息情况，不急着再往日程里加任务。",
  variable: "可以先找一个容易固定的作息点。",
  rested: "这是可以保留的日常习惯，再看看白天的感受。",
  low_energy: "疲惫的时候，先给休息留一点空间。",
  afternoon_dip: "午后这段状态记下了，我们也会了解用餐节奏。",
  steady: "继续保留适合自己的节奏。",
  regular_meals: "规律的用餐节奏可以留下来，再看看具体习惯。",
  skipped_meals: "先找到最容易被打乱的那一餐。",
  irregular_meals: "从一餐的安排开始，比同时改变全天更容易尝试。",
  late_snacks: "先记录夜间加餐的情境，再决定要调整什么。",
  sweet_drinks: "可以从一次饮料选择开始，不必一次改变全部。",
  sweets: "先观察什么时候最想吃甜食，不给自己贴标签。",
  time: "下一步一起找一个更容易安排的时段。",
  motivation: "后续先选一件小事，让完成它更容易。",
  unsure: "我们会把起点整理成可以直接尝试的小行动。",
  no_barrier: "保留让你容易坚持的习惯，再选一个小目标。",
  morning: "把第一件小事放在早晨的已有安排旁边。",
  midday: "先给午间留一段容易重复的小安排。",
  evening: "从忙完一天后还能轻松完成的小事开始。",
  varies: "不用固定钟点，先选一个每天都能遇到的生活场景。",
};
export function selectedValues(value: string) {
  return value ? value.split(",") : [];
}
export function toggleSelection(value: string, option: string) {
  const current = selectedValues(value);
  if (option === "none") return current.includes("none") ? "" : "none";
  const filtered = current.filter((v) => v !== "none");
  return (
    filtered.includes(option)
      ? filtered.filter((v) => v !== option)
      : [...filtered, option]
  ).join(",");
}
