"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatWeight } from "@/lib/categories";

export function CategoryWeightChart({
  data,
}: {
  data: { label: string; weightGrams: number; color: string }[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-card bg-white p-4 text-sm text-earth-500 shadow-soft dark:bg-forest-900 dark:text-earth-400 dark:shadow-soft-dark">
        Noch keine Gewichtsdaten für ein Diagramm.
      </div>
    );
  }

  return (
    <div className="rounded-card bg-white p-4 shadow-soft dark:bg-forest-900 dark:shadow-soft-dark">
      <h3 className="mb-3 text-base font-semibold text-forest-900 dark:text-forest-50">
        Gewicht pro Kategorie
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => formatWeight(value)}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            />
            <Bar dataKey="weightGrams" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
