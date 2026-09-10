"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumnBig, ChartPie } from "lucide-react";
import type { CategoryWeightRow } from "@/types";
import { CategoryGlyph } from "@/components/ui/CategoryIcon";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatWeight } from "@/lib/categories";
import { categoryShare, sortedCategoryWeights } from "@/lib/calculations";

type ChartMode = "bar" | "pie";

const tooltipStyle = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

/** Achsenbeschriftung: Kategorie-Icon links, Label rechts daneben. */
function CategoryTick({
  x,
  y,
  payload,
  rows,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  rows: CategoryWeightRow[];
}) {
  const row = rows.find((r) => r.label === payload?.value);
  if (!row || x === undefined || y === undefined) return null;

  return (
    <g transform={`translate(${x - 128}, ${y})`}>
      {/* Icon in der Kategoriefarbe, wie auf den Item-Karten */}
      <g style={{ color: row.color }}>
        <CategoryGlyph category={row.category} size={16} x={0} y={-8} />
      </g>
      <text
        x={22}
        y={0}
        dy={4}
        className="fill-clay-700 dark:fill-clay-300"
        fontSize={12}
      >
        {row.label}
      </text>
    </g>
  );
}

/**
 * Eigener Renderer statt LabelList-Standard: Recharts umbricht den Text
 * sonst automatisch, "210 g" landete dadurch auf zwei Zeilen.
 */
function BarValueLabel({
  x,
  y,
  width,
  height,
  value,
}: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}) {
  if (x === undefined || y === undefined || width === undefined) return null;
  return (
    <text
      x={x + width + 8}
      y={y + (height ?? 0) / 2}
      dy={4}
      fontSize={11}
      className="fill-clay-700 dark:fill-clay-400"
    >
      {formatWeight(Number(value ?? 0))}
    </text>
  );
}

export function CategoryWeightChart({ data }: { data: CategoryWeightRow[] }) {
  const [mode, setMode] = useState<ChartMode>("bar");

  const { rows: sorted, totalGrams } = useMemo(
    () => sortedCategoryWeights(data),
    [data],
  );

  if (data.length === 0) {
    return (
      <SurfaceCard className="p-4 text-sm text-clay-700 dark:text-clay-400">
        Noch keine Gewichtsdaten für ein Diagramm.
      </SurfaceCard>
    );
  }

  // Gemeinsame Höhe für beide Ansichten, damit das Cross-fade nicht springt
  const height = Math.max(240, sorted.length * 46);

  return (
    <SurfaceCard as="section" className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-clay-900 dark:text-clay-50">
          Gewicht pro Kategorie
        </h3>

        <div
          role="tablist"
          aria-label="Diagrammtyp"
          className="inline-flex rounded-control bg-clay-200 p-1 shadow-neu-in-sm dark:bg-clay-950"
        >
          {(
            [
              { id: "bar", label: "Balken", Icon: ChartColumnBig },
              { id: "pie", label: "Kuchen", Icon: ChartPie },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                mode === id
                  ? "bg-clay-200 text-ember-800 shadow-neu-sm dark:bg-clay-950 dark:text-ember-400"
                  : "text-clay-700 dark:text-clay-400"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Beide Diagramme bleiben gemountet und werden nur überblendet */}
      <div className="relative w-full" style={{ height }}>
        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            mode === "bar" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={mode !== "bar"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{ top: 4, right: 60, bottom: 4, left: 8 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={136}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={<CategoryTick rows={sorted} />}
              />
              <Tooltip
                cursor={{ fill: "currentColor", opacity: 0.06 }}
                formatter={(value: number) => [formatWeight(value), "Gewicht"]}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="weightGrams" barSize={18} radius={[0, 9, 9, 0]}>
                {sorted.map((row) => (
                  <Cell key={row.category} fill={row.color} />
                ))}
                <LabelList dataKey="weightGrams" content={<BarValueLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className={`absolute inset-0 flex flex-col gap-3 transition-opacity duration-300 ease-out sm:flex-row sm:items-center ${
            mode === "pie" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={mode !== "pie"}
        >
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sorted}
                  dataKey="weightGrams"
                  nameKey="label"
                  innerRadius="52%"
                  outerRadius="82%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {sorted.map((row) => (
                    <Cell key={row.category} fill={row.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatWeight(value), "Gewicht"]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid shrink-0 grid-cols-2 gap-x-4 gap-y-1 text-xs sm:w-48 sm:grid-cols-1">
            {sorted.map((row) => (
              <li key={row.category} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="truncate text-clay-700 dark:text-clay-300">
                  {row.label}
                </span>
                <span className="ml-auto font-bold tabular-nums text-clay-900 dark:text-clay-100">
                  {`${categoryShare(row.weightGrams, totalGrams).toFixed(
                    categoryShare(row.weightGrams, totalGrams) < 10 ? 1 : 0,
                  )} %`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SurfaceCard>
  );
}
