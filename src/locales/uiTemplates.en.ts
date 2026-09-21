// Shared UI phrases and interpolation templates. API results use stable codes.
export const sharedEnglish: Record<string, string> = {
  背部: "back",
  膝盖: "knees",
  常喝含糖饮料: "frequent sugary drinks",
};
export const messagePatterns: [string, string][] = [
  ["测评进度 {current}/{total}", "Assessment progress {current}/{total}"],
  ["修改{step}", "Edit {step}"],
  ["调整{title}", "Adjust: {title}"],
  ["预测从 {from} kg 到 {to} kg", "Projection from {from} kg to {to} kg"],
  ["你的目标 · {goal}", "Your goal · {goal}"],
  ["你的节奏 · {activity}", "Your rhythm · {activity}"],
  [
    "{age} 岁，从现在的习惯出发。{activity}，这个节奏也记下了。",
    "At {age}, start with your current habits. Your rhythm: {activity}.",
  ],
  [
    "{age} 岁，按自己的节奏{goal}。不必和别人比较。",
    "At {age}, {goal} at your own pace. No comparisons needed.",
  ],
  [
    "{weight} kg，保持这个起点。接下来一起确认你的日常节奏。",
    "At {weight} kg, maintaining is your goal. Next, let's review your routine.",
  ],
  [
    "{weight} kg，就是这次的维持目标。接下来确认你的信息。",
    "Your maintenance goal is {weight} kg. Let's review your answers next.",
  ],
  [
    "{weight} kg，起点已记下。接下来设定你的{goal}阶段目标。",
    "Your starting point is {weight} kg. Next, set a milestone for {goal}.",
  ],
  [
    "以 {weight} kg 为起点，下一步选一个{direction}一点的阶段目标。",
    "Starting at {weight} kg, choose a slightly {direction} milestone next.",
  ],
  [
    "{weight} kg，和现在相差 {difference} kg。把它作为第一站，按自己的节奏前进。",
    "At {weight} kg, your goal is {difference} kg from where you are now. Take it at your own pace.",
  ],
  [
    "从 {weight} kg 到 {target} kg，先把这 {difference} kg 作为一个阶段。",
    "From {weight} kg to {target} kg: make this {difference} kg your first milestone.",
  ],
];
