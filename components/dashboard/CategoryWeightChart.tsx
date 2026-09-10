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
import type { Category } from "@/types";
import { CategoryGlyph } from "@/components/ui/CategoryIcon";
import { formatWeight } from "@/lib/categories";

type ChartRow = {
  category: Category;
  label: string;
  weightGrams: number;
  color: string;
};

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
  rows: ChartRow[];
}) {
  const row = rows.find((r) => r.label === payload?.value);
  if (!row || x === undefined || y === undefined) return null;

  return (
    <g transform={`translate(${x - 128}, ${y})`}>
      <CategoryGlyph
        category={row.category}
        size={16}
        x={0}
        y={-8}
        className="text-forest-600 dark:text-forest-300"
      />
      <text
        x={22}
        y={0}
        dy={4}
        className="fill-earth-700 dark:fill-earth-200"
        fontSize={12}
      >
        {row.label}
      </text>
    </g>
  );
}

export function CategoryWeightChart({ data }: { data: ChartRow[] }) {
  const [mode, setMode] = useState<ChartMode>("bar");

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.weightGrams - a.weightGrams),
    [data],
  );
  const total = useMemo(
    () => sorted.reduce((sum, row) => sum + row.weightGrams, 0),
    [sorted],
  );

  if (data.length === 0) {
    return (
      <div className="rounded-card bg-white p-4 text-sm text-earth-500 shadow-soft dark:bg-forest-900 dark:text-earth-400 dark:shadow-soft-dark">
        Noch keine Gewichtsdaten für ein Diagramm.
      </div>
    );
  }

  // Gemeinsame Höhe für beide Ansichten, damit das Cross-fade nicht springt
  const height = Math.max(240, sorted.length * 46);

  return (
    <section className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-forest-900 dark:text-forest-50">
          Gewicht pro Kategorie
        </h3>

        <div
          role="tablist"
          aria-label="Diagrammtyp"
          className="inline-flex rounded-2xl bg-forest-50 p-1 dark:bg-forest-950"
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
                  ? "bg-white text-forest-900 shadow-sm dark:bg-forest-700 dark:text-forest-50"
                  : "text-earth-600 hover:text-forest-800 dark:text-earth-300 dark:hover:text-forest-100"
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
              margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
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
                <LabelList
                  dataKey="weightGrams"
                  position="right"
                  className="fill-earth-600 dark:fill-earth-300"
                  fontSize={11}
                  formatter={(value: number) => formatWeight(value)}
                />
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
                <span className="truncate text-earth-700 dark:text-earth-200">
                  {row.label}
                </span>
                <span className="ml-auto font-semibold tabular-nums text-forest-800 dark:text-forest-100">
                  {total === 0
                    ? "0 %"
                    : `${((row.weightGrams / total) * 100).toFixed(
                        row.weightGrams / total < 0.1 ? 1 : 0,
                      )} %`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
