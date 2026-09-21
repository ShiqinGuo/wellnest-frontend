// Frontend-owned presentation; keys are generated API enums.
import type {
  PlanCode,
  BmiCategory,
  CalculationAssumption,
  ResultSummary,
} from "../generated/contract";
export const messages = {
  movement_title: "找到合适的活动起点",
  recovery_title: "给恢复留出位置",
  meals_title: "从一件饮食小事开始",
  consistency_title: "让行动容易发生",
  seated: "而日常大部分时间坐着",
  on_feet: "日常也经常站立或走动",
  movement_break: "在一次工作间歇起身走动，把日常活动与正式运动分开安排。",
  observe_activity: "先记录一天活动后的感受，再安排自己熟悉且舒适的运动。",
  familiar_activity: "选一种熟悉、愿意重复的活动，从容易坚持的一次开始。",
  gentle_movement: "你想活动更自在，可以优先选择让自己感觉舒适的轻柔活动。",
  familiar_strength: "你希望积累力量，可以从熟悉的力量练习或入门指导开始。",
  seek_advice: "保留舒适的日常活动；涉及不适部位的动作，先请专业人员评估。",
  record_sleep: "先记录入睡、起床时间和白天感受，找一个容易保持的作息锚点。",
  keep_sleep: "保留目前的作息，把休息时间和运动一起安排。",
  protect_meal: "先为最容易被打乱的一餐留出时间，观察怎样安排更容易做到。",
  unsweetened_drink: "从一次饮料选择开始，试试你愿意接受的无糖替代。",
  record_snack: "记录一次夜间加餐前的饥饿感与当天用餐情况，再决定要调整什么。",
  record_sweets:
    "观察自己什么时候最想吃甜食，先记录情境，不急着同时改变所有习惯。",
  keep_meals: "保留当前的用餐节奏，记录忙碌日里哪些安排最容易延续。",
  pair_action: "把行动挂在一个已有的日常安排之后。",
  record_action: "只选上面一件小事，完成后留一个记录。",
  try_easiest: "从上面最容易的一项开始，先试一次再回顾。",
  review_routine: "选一个固定的回顾时间，看看哪些安排值得继续。",
  experience: "{experience}",
  activity: "{activity}",
  sleep_energy: "你说自己{sleep}，同时{energy}",
  meal_habits: "你{mealRhythm}；{foodHabits}",
  barrier: "{barrier}",
  schedule_action: "把第一件小事放在{timeWindow}，先确认它能融入生活。",
  preference: "{preference}",
  limitation_boundary:
    "你提到{limitations}不适：先确认适合自己的活动方式；这里不安排针对这些部位的训练。",
} satisfies Record<PlanCode, string>;
export const labels: Record<string, Record<string, string>> = {
  experience: {
    beginner: "你正在建立运动习惯",
    returning: "你希望重新找回运动节奏",
    regular: "你已经有运动经验",
  },
  activity: {
    low: "很少专门运动",
    light: "每周运动 1–2 次",
    moderate: "每周运动 3–4 次",
    high: "每周运动 5 次及以上",
  },
  sleep: {
    short: "通常睡眠不足",
    variable: "睡眠时间不固定",
    rested: "通常睡眠充足",
  },
  energy: {
    low_energy: "白天容易疲惫",
    afternoon_dip: "午后容易犯困",
    steady: "精力比较稳定",
  },
  mealRhythm: {
    regular_meals: "三餐比较规律",
    skipped_meals: "有时会跳过一餐",
    irregular_meals: "用餐时间不固定",
  },
  foodHabits: {
    late_snacks: "夜间加餐",
    sweet_drinks: "常喝含糖饮料",
    sweets: "喜欢甜食",
    none: "没有列出的饮食习惯",
  },
  barrier: {
    time: "你最担心没有时间",
    motivation: "你容易开始，却难以持续",
    unsure: "你还不确定从哪里开始",
    no_barrier: "你暂时没有明显的坚持障碍",
  },
  timeWindow: {
    morning: "早晨",
    midday: "午间",
    evening: "晚间",
    varies: "每天灵活选择的空档",
  },
  limitations: {
    back: "背部",
    knees: "膝盖",
  },
  preference: {
    energy: "日常更有精神",
    mobility: "活动更自在",
    routine: "建立稳定习惯",
    strength: "积累力量",
  },
};
export const resultMessages = {
  underweight: "偏低",
  reference: "参考范围内",
  overweight: "偏高",
  high: "较高",
  personal_start: "从了解自己开始，让每一步更有方向。",
  legacy_energy: "采用成人 Mifflin–St Jeor 公式及简化活动系数。",
  resting_energy: "静息能量使用Mifflin–St Jeor公式；活动系数为简化分档。",
  demo_energy_budget: "减重采用15%能量差，增重采用250 kcal/日；均为演示规则。",
  linear_projection:
    "曲线采用7700 kcal/kg的线性近似，未模拟代谢适应，日期不是承诺。",
  adult_scope:
    "适用于18–80岁一般成人的演示估算，不用于孕期、哺乳期或医疗营养决策。",
} satisfies Record<BmiCategory | CalculationAssumption | ResultSummary, string>;
