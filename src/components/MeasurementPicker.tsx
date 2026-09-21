import { useI18n } from "../i18n";
import {
  measurementChoices,
  measurementIncrement,
  targetChoiceRatios,
} from "../flow";
import type { Answers, Step } from "../generated/contract";

import { MeasurementStory, storySteps } from "./MeasurementStory";

type Props = {
  step: Step;
  title: string;
  unit?: string;
  min?: number;
  max?: number;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  answers?: Answers;
};
export function MeasurementPicker({
  step,
  title,
  unit,
  min = 0,
  max = 0,
  value,
  onChange,
  disabled,
  answers,
}: Props) {
  const { t } = useI18n();
  const increment = step === "age" ? 1 : measurementIncrement;
  const choices =
    step === "target" && answers?.weightKg
      ? targetChoiceRatios.map((ratio) =>
          Number(
            (
              answers.weightKg! *
              (1 + (answers.goal === "gain" ? ratio : -ratio))
            ).toFixed(1),
          ),
        )
      : (measurementChoices[step] ?? []);
  const allowed = choices.filter((n) => n >= min && n <= max);
  const preview =
    value === ""
      ? (allowed[Math.floor(allowed.length / 2)] ?? min)
      : Number(value);
  const adjust = (direction: number) =>
    onChange(
      Math.min(
        max,
        Math.max(min, Number((preview + direction * increment).toFixed(1))),
      ).toString(),
    );
  const hasStory = storySteps.includes(step);
  const valid =
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max &&
    (step !== "age" || Number.isInteger(Number(value)));
  return (
    <div className={hasStory ? "measurement-layout" : "measurement-picker"}>
      {hasStory && (
        <MeasurementStory
          step={step}
          value={value}
          valid={valid}
          answers={answers}
        />
      )}
      <div className="measurement-controls">
        <p className="question-hint">
          {t(
            step === "target"
              ? "先选一个阶段目标，也可以自己调整。"
              : "点选接近的数值，再调整到你的实际情况。",
          )}
        </p>
        <div className="quick-values" aria-label={t("快捷选择")}>
          {allowed.map((n) => (
            <button
              key={n}
              type="button"
              disabled={disabled}
              aria-pressed={value === String(n)}
              onClick={() => onChange(String(n))}
            >
              {n}
              <small> {t(unit)}</small>
            </button>
          ))}
        </div>
        <div className="measurement-display">
          <button
            type="button"
            aria-label={t("减小数值")}
            disabled={disabled || (value !== "" && preview <= min)}
            onClick={() => adjust(-1)}
          >
            −
          </button>
          <output key={value} className="number-feedback" aria-live="polite">
            {t(value || "—")}
            <small>{t(unit)}</small>
          </output>
          <button
            type="button"
            aria-label={t("增大数值")}
            disabled={disabled || (value !== "" && preview >= max)}
            onClick={() => adjust(1)}
          >
            +
          </button>
        </div>
        <div className="ruler" aria-hidden="true" />
        <input
          className="measurement-slider"
          type="range"
          aria-label={t(`调整${title.replace("？", "")}`)}
          min={min}
          max={max}
          step={increment}
          value={Number.isFinite(preview) ? preview : min}
          disabled={disabled || min > max}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="range-labels">
          <span>
            {min} {t(unit)}
          </span>
          <span>
            {max} {t(unit)}
          </span>
        </div>
        <details className="manual-entry">
          <summary>{t("直接输入数值")}</summary>
          <label htmlFor="measurement">{t(title)}</label>
          <input
            id="measurement"
            type="number"
            inputMode={step === "age" ? "numeric" : "decimal"}
            min={min}
            max={max}
            step={increment}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          />
        </details>
        {min > max && (
          <p role="alert">
            {t("当前数据没有适用的阶段目标，请返回调整目标。")}
          </p>
        )}
        {t(
          value && (Number(value) < min || Number(value) > max) && (
            <p role="alert">
              {t("请选择")}
              {min}–{max} {t(unit)} {t("之间的数值。")}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
