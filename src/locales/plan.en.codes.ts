// Frontend-owned presentation; keys are generated API enums.
import type {
  PlanCode,
  BmiCategory,
  CalculationAssumption,
  ResultSummary,
} from "../generated/contract";
export const messages = {
  movement_title: "Find a comfortable starting point",
  recovery_title: "Make room for recovery",
  meals_title: "Start with one small food habit",
  consistency_title: "Make action easy",
  seated: "and spend much of your day sitting",
  on_feet: "and often stand or walk during the day",
  movement_break:
    "Take a movement break during work. Plan everyday movement separately from exercise.",
  observe_activity:
    "Notice how you feel after an active day, then choose familiar, comfortable exercise.",
  familiar_activity:
    "Choose a familiar activity you'd enjoy repeating. Start with one manageable session.",
  gentle_movement:
    "Since comfort matters to you, start with gentle movement that feels comfortable.",
  familiar_strength:
    "To build strength, begin with familiar exercises or beginner guidance.",
  seek_advice:
    "Keep comfortable everyday movement. Get professional advice before exercising areas that feel uncomfortable.",
  record_sleep:
    "Note your sleep and wake times and how you feel during the day. Find one routine you can keep consistent.",
  keep_sleep: "Keep your current sleep routine. Plan rest alongside activity.",
  protect_meal:
    "Make time for the meal that's most easily disrupted. Notice what makes it easier to keep.",
  unsweetened_drink:
    "Start with one drink choice. Try an unsweetened alternative you enjoy.",
  record_snack:
    "Before an evening snack, note your hunger and meals that day. Then decide what to adjust.",
  record_sweets:
    "Notice when you most want sweet foods. Record the context before changing several habits at once.",
  keep_meals:
    "Keep your current meal routine. Notice which arrangements hold up on busy days.",
  pair_action: "Pair an action with something you already do each day.",
  record_action:
    "Choose just one small action above. Make a note when you've done it.",
  try_easiest:
    "Try the easiest action above once, then reflect on how it went.",
  review_routine:
    "Choose a regular time to reflect on which habits are worth keeping.",
  experience: "{experience}",
  activity: "{activity}",
  sleep_energy:
    "You reported that you {sleep}, alongside this energy pattern: {energy}.",
  meal_habits: "You {mealRhythm}. Eating habits: {foodHabits}.",
  barrier: "{barrier}",
  schedule_action:
    "Try your first small action during {timeWindow}. See how it fits your day.",
  preference: "{preference}",
  limitation_boundary:
    "You mentioned discomfort in your {limitations}. Find activities that suit you; this plan doesn't prescribe exercises for those areas.",
} satisfies Record<PlanCode, string>;
export const labels: Record<string, Record<string, string>> = {
  experience: {
    beginner: "You're building an exercise habit",
    returning: "You'd like to return to exercise",
    regular: "You already have exercise experience",
  },
  activity: {
    low: "Rarely exercise",
    light: "you exercise 1–2 times a week",
    moderate: "you exercise 3–4 times a week",
    high: "you exercise 5 or more times a week",
  },
  sleep: {
    short: "often feel short of sleep",
    variable: "have variable sleep times",
    rested: "usually feel well rested",
  },
  energy: {
    low_energy: "often feel tired during the day",
    afternoon_dip: "I tend to feel sleepy in the afternoon",
    steady: "have fairly steady energy",
  },
  mealRhythm: {
    regular_meals: "have fairly regular meals",
    skipped_meals: "sometimes skip a meal",
    irregular_meals: "have variable meal times",
  },
  foodHabits: {
    late_snacks: "Night snacks",
    sweet_drinks: "frequent sugary drinks",
    sweets: "enjoying sweet foods",
    none: "none of the listed eating habits",
  },
  barrier: {
    time: "Finding time is your main concern",
    motivation: "You find it easy to start but harder to keep going",
    unsure: "You're not yet sure where to begin",
    no_barrier: "You have no particular barrier to consistency right now",
  },
  timeWindow: {
    morning: "Morning",
    midday: "Midday",
    evening: "Evening",
    varies: "a flexible opening in your day",
  },
  limitations: {
    back: "back",
    knees: "knees",
  },
  preference: {
    energy: "More everyday energy",
    mobility: "Move more comfortably",
    routine: "Build steady habits",
    strength: "Build strength",
  },
};
export const resultMessages = {
  underweight: "Underweight",
  reference: "Within range",
  overweight: "Overweight",
  high: "High range",
  personal_start: "从了解自己开始，让每一步更有方向。",
  legacy_energy:
    "Uses the adult Mifflin–St Jeor equation and simplified activity factors.",
  resting_energy:
    "Resting energy uses the Mifflin–St Jeor equation with simplified activity factors.",
  demo_energy_budget:
    "Demo rules use a 15% calorie deficit for weight loss and a 250 kcal/day surplus for weight gain.",
  linear_projection:
    "The projection uses a linear 7,700 kcal/kg approximation, without metabolic adaptation. The date is not a promise.",
  adult_scope:
    "A demonstration estimate for adults aged 18–80. Not for pregnancy, breastfeeding or medical nutrition decisions.",
} satisfies Record<BmiCategory | CalculationAssumption | ResultSummary, string>;
