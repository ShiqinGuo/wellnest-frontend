import { useI18n } from "../i18n";
import {
  Check,
  Sparkles,
  Moon,
  Sun,
  Clock,
  Coffee,
  Footprints,
  Heart,
  Dumbbell,
  Utensils,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import {
  profileQuestions,
  profileLabels,
  selectedValues,
  toggleSelection,
} from "../profile";
import { choicePhotoFor } from "../imagery";
import type { Answers, Step } from "../generated/contract";
const icons: Record<string, LucideIcon> = {
  energy: Sun,
  mobility: Footprints,
  routine: Calendar,
  strength: Dumbbell,
  short: Moon,
  variable: Clock,
  rested: Sun,
  late_snacks: Moon,
  sweet_drinks: Coffee,
  sweets: Heart,
  time: Clock,
  motivation: Heart,
  unsure: Sparkles,
  no_barrier: Check,
  morning: Sun,
  midday: Coffee,
  evening: Moon,
  varies: Calendar,
  regular_meals: Utensils,
  skipped_meals: Clock,
  irregular_meals: Calendar,
};
export function ProfileQuestion({
  step,
  value,
  onChange,
  disabled,
  answers,
}: {
  step: Step;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  answers?: Answers;
}) {
  const { t } = useI18n();
  const q = profileQuestions[step]!;
  const scene = q.scene;
  const photo =
    scene === "food"
      ? { src: "/images/meal-prep.webp", position: "50% 55%" }
      : scene === "daylight"
        ? { src: "/images/daylight.webp", position: "50% 65%" }
        : scene === "sleep"
          ? { src: "/images/rest.webp", position: "50% 50%" }
          : choicePhotoFor(scene === "desk" ? "low" : "moderate", answers?.sex);
  const selected = selectedValues(value);
  return (
    <div className="profile-layout">
      <figure className={`profile-photo ${value ? "has-selection" : ""}`}>
        <img
          src={photo.src}
          alt=""
          style={{ objectPosition: photo.position }}
        />
        <figcaption>{t(q.caption)}</figcaption>
      </figure>
      <div>
        <p className="profile-hint">
          {t(q.multi ? "可以多选，选择符合你的情况" : "选择最接近你日常的一项")}
        </p>
        <div
          className="profile-options"
          role={q.multi ? "group" : "radiogroup"}
          aria-label={t(q.title)}
        >
          {q.options.map((option) => {
            const Icon =
              icons[option] ?? (scene === "movement" ? Footprints : Heart);
            return (
              <button
                type="button"
                role={q.multi ? "checkbox" : "radio"}
                aria-checked={selected.includes(option)}
                aria-label={t(profileLabels[option])}
                className={`profile-option ${selected.includes(option) ? "selected" : ""}`}
                disabled={disabled}
                key={option}
                onClick={() =>
                  onChange(q.multi ? toggleSelection(value, option) : option)
                }
              >
                <Icon size={23} />
                <span>{t(profileLabels[option])}</span>
                <span className="radio">
                  {selected.includes(option) && <Check size={15} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
