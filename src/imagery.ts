import type { Sex } from "./generated/contract";
// Visual assets belong to the frontend; no media URLs are persisted with health data.
export const imagery = {
  movement: {
    src: "/images/yoga-stretch.jpg",
    alt: "在室内垫上舒展身体的男性",
    source:
      "https://unsplash.com/photos/man-stretching-on-black-mat-TTqSzjAXqaA",
    photographer: "wee lee",
  },
  hero: {
    src: "/images/pilates-stretch.jpg",
    alt: "明亮的工作室里，一位女性正在舒展身体",
    source:
      "https://unsplash.com/photos/a-woman-is-doing-exercises-on-a-pilates-xtR4JjZeogY",
    photographer: "Ahmet Kurt",
  },
} as const;

const maleScenes = {
  low: { src: "/images/male-desk.webp", position: "75% 60%" },
  light: { src: "/images/male-outdoors.webp", position: "50% 50%" },
  moderate: { src: imagery.movement.src, position: "50% 40%" },
  high: { src: "/images/male-strength.webp", position: "40% 35%" },
} as const;

export function choicePhotoFor(
  kind: keyof typeof choiceImagery,
  sex?: Sex | null,
) {
  if (sex !== "male" || kind === "female" || kind === "male")
    return choiceImagery[kind];
  if (kind === "lose") return maleScenes.light;
  if (kind === "maintain") return maleScenes.moderate;
  if (kind === "gain") return maleScenes.high;
  return maleScenes[kind];
}

const desk = { src: "/images/desk.webp", position: "82% 45%" };
const walking = { src: "/images/walking.webp", position: "50% 20%" };
const strength = { src: "/images/strength.webp", position: "58% 34%" };
const stretch = { src: "/images/stretch.webp", position: "65% 44%" };
export const choiceImagery = {
  low: desk,
  light: walking,
  moderate: stretch,
  high: strength,
  lose: walking,
  maintain: { src: imagery.hero.src, position: "50% 45%" },
  gain: strength,
  female: walking,
  male: { src: imagery.movement.src, position: "50% 20%" },
} as const;
