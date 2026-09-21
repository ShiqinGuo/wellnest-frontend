import { presentPlan, renderResultCode } from "../planPresentation";
import { useI18n, Locale } from "../i18n";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Footprints,
  Moon,
  Utensils,
  CalendarDays,
  LockKeyhole,
  Leaf,
  Target,
} from "lucide-react";
import type {
  Answers,
  FreeResult,
  MemberResult,
  PlanTopic,
} from "../generated/contract";
import { labels } from "../flow";
import { profileLabels } from "../profile";
import { Chart } from "./Chart";
import { PersonalPlan } from "./PersonalPlan";
import { GuidanceCard } from "./GuidanceCard";

const topics = {
  movement: { label: "活动起点", icon: Footprints, accent: "sage" },
  recovery: { label: "休息与精力", icon: Moon, accent: "lavender" },
  meals: { label: "饮食节奏", icon: Utensils, accent: "peach" },
  consistency: { label: "坚持的方式", icon: CalendarDays, accent: "sand" },
} as const;
const frequency = {
  low: "尚无规律",
  light: "1–2",
  moderate: "3–4",
  high: "5+",
};
const sleepLabel = {
  short: "常感睡不够",
  variable: "作息不固定",
  rested: "醒来有精神",
};
const mealLabel = {
  regular_meals: "三餐规律",
  skipped_meals: "偶尔漏餐",
  irregular_meals: "用餐不定时",
};
const barrierLabel = {
  time: "找到空档",
  motivation: "从小事开始",
  unsure: "找到起点",
  no_barrier: "保持节奏",
};
const timeSlots = {
  morning: "早晨",
  midday: "午间",
  evening: "晚间",
  varies: "灵活安排",
};
const answerLabel = (value?: string | null) =>
  value ? profileLabels[value] || labels[value] || value : "尚未填写";
const number = (value: number) => Number(value.toFixed(1)).toString();

export function HealthDashboard({
  result,
  answers,
  busy,
  onUnlock,
  onRestart,
  onRetry,
}: {
  result: FreeResult | MemberResult;
  answers: Answers;
  busy: boolean;
  onUnlock: () => void;
  onRestart: () => void;
  onRetry: () => void;
}) {
  const { t, formatNumber, locale } = useI18n();
  const [selected, setSelected] = useState<PlanTopic>("movement");
  const plan = presentPlan(result.planPreview, locale);
  const card = plan?.cards.find((c) => c.topic === selected);
  const weight = answers.weightKg;
  const target = answers.targetWeightKg;
  const delta = weight != null && target != null ? target - weight : null;
  const member = result.access === "member" ? result.calculation : null;
  const focus =
    member?.guidance?.status === "ready" ? member.guidance.focus : null;
  const habits = answers.foodHabits?.filter((h) => h !== "none") ?? [];
  const dimensionValues = {
    movement: answers.activity ? frequency[answers.activity] : "尚未填写",
    recovery: answers.sleep ? sleepLabel[answers.sleep] : "尚未填写",
    meals: answers.mealRhythm ? mealLabel[answers.mealRhythm] : "尚未填写",
    consistency: answers.barrier ? barrierLabel[answers.barrier] : "尚未填写",
  };
  const evidence: Record<PlanTopic, [string, string][]> = {
    movement: [
      ["运动经验", answerLabel(answers.experience)],
      ["每周运动", answerLabel(answers.activity)],
      ["运动以外", answerLabel(answers.dailyActivity)],
      [
        "身体感受",
        answers.limitations?.map(answerLabel).join("、") || "尚未填写",
      ],
    ],
    recovery: [
      ["睡眠感受", answerLabel(answers.sleep)],
      ["白天精力", answerLabel(answers.energy)],
    ],
    meals: [
      ["用餐节奏", answerLabel(answers.mealRhythm)],
      [
        "饮食习惯",
        answers.foodHabits?.map(answerLabel).join("、") || "尚未填写",
      ],
    ],
    consistency: [
      ["遇到的困难", answerLabel(answers.barrier)],
      ...(answers.barrier === "time"
        ? [["可用时段", answerLabel(answers.timeWindow)] as [string, string]]
        : []),
    ],
  };
  return (
    <section className="dashboard">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">{t("MY WELLNEST · 从了解自己开始")}</span>
          <h1 tabIndex={-1}>
            {t(result.access === "member" ? "你的完整评估" : "你的身体概况")}
          </h1>
          <p>{t("把目标放进生活，让改变有迹可循。")}</p>
        </div>
        <button
          className="dashboard-restart"
          disabled={busy}
          onClick={onRestart}
        >
          {t("重新测评")}
          <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="overview-grid">
        <article className="goal-overview">
          <div className="tile-top">
            <span>
              <Target size={17} /> {t("你的目标")}
            </span>
            <span className="goal-tag">
              {t(answers.goal ? labels[answers.goal] : "体重管理")}
            </span>
          </div>
          <div className="goal-numbers">
            <div>
              <small>{t("现在")}</small>
              <strong>
                {t(weight ?? "—")}
                <em>kg</em>
              </strong>
            </div>
            <ArrowRight size={26} />
            <div>
              <small>{t("期望")}</small>
              <strong>
                {t(target ?? "—")}
                <em>kg</em>
              </strong>
            </div>
          </div>
          <div className="goal-baseline">
            <i />
            <span />
            <i />
          </div>
          <p className="goal-difference">
            {t(
              delta === null ? (
                "补充体重，了解你的目标"
              ) : delta === 0 ? (
                "维持现在的体重，照顾好日常节奏"
              ) : (
                <>
                  {t("目标差值")}
                  {t(" ")}
                  <b>
                    {t(delta > 0 ? "+" : "−")}
                    {t(number(Math.abs(delta)))} kg
                  </b>
                  <span>
                    {t(" ")}
                    {t("· 当前体重的")}
                    {t(number((Math.abs(delta) / weight!) * 100))}%
                  </span>
                </>
              ),
            )}
          </p>
          <div className="goal-preferences">
            {plan?.preferences.map((p) => (
              <span key={p}>
                <Leaf size={13} />
                {p}
              </span>
            ))}
          </div>
        </article>
        <article className="dashboard-bmi">
          <div className="tile-top">
            <span>{t("身体质量指数")}</span>
            <small>BMI</small>
          </div>
          <div className="dashboard-bmi-value">
            <strong>{result.bmi}</strong>
            <span>{renderResultCode(result.bmiCategory, locale)}</span>
          </div>
          <p className="body-facts">
            {answers.age} {t("岁")}
            <span>·</span> {answers.heightCm} cm
          </p>
          <p className="metric-note">
            {t("身高与体重的参考值，不能反映全部健康状况。")}
          </p>
        </article>
        <article className="dashboard-intro-photo">
          <img
            src="/images/daylight.webp"
            alt={t("阳光透过窗户，落在绿植与杯子旁")}
          />
          <div>
            <span>ONE STEP AT A TIME</span>
            <h2>
              {t("按你的节奏，")}
              <br />
              {t("慢慢来。")}
            </h2>
          </div>
        </article>
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span className="eyebrow">YOUR EVERYDAY</span>
          <h2>{t("你的生活画像")}</h2>
        </div>
        <p>{t("根据你刚才的回答 · 点选查看")}</p>
      </div>
      <div className="dimension-grid" aria-label={t("生活画像维度")}>
        {(Object.keys(topics) as PlanTopic[]).map((topic) => {
          const Icon = topics[topic].icon;
          return (
            <button
              key={topic}
              className={`dimension-tile ${topics[topic].accent} ${selected === topic ? "active" : ""}`}
              aria-pressed={selected === topic}
              aria-controls="dimension-detail"
              onClick={() => setSelected(topic)}
            >
              <span className="tile-top">
                <span>
                  <Icon size={19} />
                  {t(topics[topic].label)}
                </span>
                <ArrowUpRight size={17} />
              </span>
              <strong>
                {t(dimensionValues[topic])}
                {topic === "movement" &&
                  answers.activity &&
                  answers.activity !== "low" && <small> {t("次 / 周")}</small>}
              </strong>
              {topic === "movement" ? (
                <div className="frequency-bands" aria-hidden="true">
                  {Object.entries(frequency).map(([key, label]) => (
                    <span
                      key={key}
                      className={answers.activity === key ? "chosen" : ""}
                    >
                      {t(label)}
                    </span>
                  ))}
                </div>
              ) : topic === "recovery" ? (
                <p>
                  <Moon size={15} /> {t("夜间休息")}
                  <span>→</span> {t("白天精力")}
                </p>
              ) : topic === "meals" ? (
                <div className="habit-dots">
                  {answers.foodHabits ? (
                    habits.length ? (
                      habits.map((h) => (
                        <span key={h}>
                          {t(
                            profileLabels[h]
                              .replace("经常", "")
                              .replace("习惯", "")
                              .replace("喜欢", ""),
                          )}
                        </span>
                      ))
                    ) : (
                      <span>{t("未选择额外饮食习惯")}</span>
                    )
                  ) : (
                    <span>{t("尚未填写饮食习惯")}</span>
                  )}
                </div>
              ) : (
                <p>
                  <CalendarDays size={15} />
                  {t(
                    answers.barrier === "time" && answers.timeWindow
                      ? timeSlots[answers.timeWindow]
                      : answers.barrier
                        ? "找到一件容易重复的小事"
                        : "补充习惯，找到适合的起点",
                  )}
                </p>
              )}
            </button>
          );
        })}
      </div>
      <div
        id="dimension-detail"
        className={`dimension-detail ${topics[selected].accent}`}
        aria-live="polite"
      >
        <div key={selected} className="dimension-explanation feedback-enter">
          <span className="eyebrow">{t(topics[selected].label)}</span>
          <h3>{card?.title || t("再多了解一点你的日常")}</h3>
          <p>
            {card?.action ||
              t(
                "这份测评还没有生活习惯信息。重新测评后，这里会呈现适合你的行动建议。",
              )}
          </p>
          {selected === "movement" &&
            plan?.boundaries.map((boundary) => (
              <p className="plan-boundary" key={boundary}>
                {boundary}
              </p>
            ))}
        </div>
        <dl className="dimension-evidence">
          {evidence[selected].map(([label, value]) => (
            <div key={label}>
              <dt>{t(label)}</dt>
              <dd>{t(value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span className="eyebrow">LOOKING AHEAD</span>
          <h2>{t("从现在，走向你的目标")}</h2>
        </div>
        <p>{t(member ? "基于本次测评的估算" : "更多属于你的身体参考")}</p>
      </div>
      {member ? (
        <div className="forecast-grid">
          <article className="energy-budget">
            <span className="eyebrow">{t("每日摄入参考")}</span>
            <strong className="calorie-number">
              {locale === Locale.English
                ? formatNumber(member.suggestedKcal)
                : member.suggestedKcal}
              <small> kcal</small>
            </strong>
            <p>{t("与你的目标相匹配的热量参考")}</p>
            <dl>
              <div>
                <dt>{t("静息消耗估算")}</dt>
                <dd>
                  {locale === Locale.English
                    ? formatNumber(member.restingKcal)
                    : member.restingKcal}{" "}
                  kcal
                </dd>
              </div>
              <div>
                <dt>{t("维持体重参考")}</dt>
                <dd>
                  {locale === Locale.English
                    ? formatNumber(member.maintenanceKcal)
                    : member.maintenanceKcal}{" "}
                  kcal
                </dd>
              </div>
              <div>
                <dt>{t("目标预测日期")}</dt>
                <dd>{t(member.predictedGoalDate)}</dd>
              </div>
            </dl>
            <details>
              <summary>{t("这些数字如何理解？")}</summary>
              <ul>
                {member.assumptions.map((a) => (
                  <li key={a}>{renderResultCode(a, locale)}</li>
                ))}
              </ul>
            </details>
          </article>
          <article className="forecast-chart">
            <Chart points={member.projection} />
          </article>
        </div>
      ) : (
        <article className="dashboard-unlock">
          <div className="unlock-symbol">
            <LockKeyhole size={26} />
          </div>
          <div>
            <h3>{t("让下一步更清晰")}</h3>
            <p>{t("每日热量建议 · 目标预测日期 · 体重变化曲线")}</p>
          </div>
          <button className="primary" disabled={busy} onClick={onUnlock}>
            {t("查看我的完整评估")}
            <ArrowRight size={17} />
          </button>
        </article>
      )}

      {plan && (
        <details className="all-actions">
          <summary>
            <span>
              <Leaf size={18} /> {t("查看完整行动安排")}
            </span>
            <span>
              {t("展开四个生活维度")}
              <ArrowRight size={16} />
            </span>
          </summary>
          <PersonalPlan plan={result.planPreview} focus={focus} />
        </details>
      )}
      {member && !plan && <GuidanceCard guidance={member.guidance} />}
      {member?.guidance &&
        ["unavailable", "uncertain"].includes(member.guidance.status) && (
          <button className="text-button" disabled={busy} onClick={onRetry}>
            {t(busy ? "正在重试…" : "重新生成行动建议")}
          </button>
        )}
    </section>
  );
}
