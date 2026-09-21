import { useI18n } from "../i18n";
import { useId, useState } from "react";

const plot = {
  left: 38,
  right: 550,
  top: 25,
  bottom: 155,
  width: 580,
  height: 192,
};

export function Chart({
  points,
}: {
  points: { date: string; weightKg: number }[];
}) {
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const gradientId = useId();
  const selected = points[selectedIndex] ?? points[0];
  const weights = points.map((p) => p.weightKg),
    lo = Math.min(...weights) - 1,
    hi = Math.max(...weights) + 1;
  const firstDate = Date.parse(points[0].date),
    lastDate = Date.parse(points.at(-1)!.date);
  const x = (date: string) =>
    firstDate === lastDate
      ? (plot.left + plot.right) / 2
      : plot.left +
        ((Date.parse(date) - firstDate) / (lastDate - firstDate)) *
          (plot.right - plot.left);
  const y = (weight: number) =>
    plot.bottom - ((weight - lo) / (hi - lo)) * (plot.bottom - plot.top);
  const coords = points.map((p) => `${x(p.date)},${y(p.weightKg)}`).join(" ");
  const ticks = [
    ...new Set([Math.max(...weights), (lo + hi) / 2, Math.min(...weights)]),
  ];
  return (
    <figure className="chart">
      <figcaption>
        {t("阶段变化参考")}
        <span>{t("预测 · kg")}</span>
      </figcaption>
      <div className="projection-readout" aria-live="polite">
        <span>{t(selected.date)}</span>
        <strong>
          {selected.weightKg}
          <small> kg</small>
        </strong>
      </div>
      <svg
        viewBox={`0 0 ${plot.width} ${plot.height}`}
        role="img"
        aria-label={t(
          `预测从 ${points[0].weightKg} kg 到 ${points.at(-1)!.weightKg} kg`,
        )}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#91b795" stopOpacity=".3" />
            <stop offset="100%" stopColor="#91b795" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <path
              d={`M${plot.left} ${y(tick)}H${plot.right}`}
              stroke="#e2e6dc"
              strokeDasharray="3 5"
            />
            <text x="0" y={y(tick) + 4}>
              {Number(tick.toFixed(1))}
            </text>
          </g>
        ))}
        {points.length > 1 && (
          <polygon
            points={`${x(points[0].date)},${plot.bottom} ${coords} ${x(points.at(-1)!.date)},${plot.bottom}`}
            fill={`url(#${gradientId})`}
          />
        )}
        <polyline
          points={coords}
          fill="none"
          stroke="#426e54"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d={`M${x(selected.date)} ${y(selected.weightKg)}V${plot.bottom}`}
          stroke="#729b77"
          strokeDasharray="3 4"
        />
        <circle
          cx={x(selected.date)}
          cy={y(selected.weightKg)}
          r="5"
          fill="#426e54"
          stroke="#fffef9"
          strokeWidth="2"
        />
        <text x={plot.left} y="183">
          {t(points[0].date)}
        </text>
        <text x={plot.right} y="183" textAnchor="end">
          {t(points.at(-1)!.date)}
        </text>
      </svg>
      {points.length > 1 && (
        <label className="projection-control">
          <span>{t("查看预测节点")}</span>
          <input
            type="range"
            aria-label={t("查看预测节点")}
            min={0}
            max={points.length - 1}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
          />
        </label>
      )}
      <p>
        {t(
          points.length === 1
            ? "维持当前体重，关注长期趋势。"
            : "理想化线性估算，实际变化因人而异。",
        )}
      </p>
    </figure>
  );
}
