import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tip = {
  contentStyle: {
    background: "var(--card)",
    border: "1px solid var(--rule)",
    borderRadius: 0,
    color: "var(--ink)",
    fontSize: 12,
  },
};

function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

export function FlowChart({ data }: { data: { m: string; inn: number; out: number }[] }) {
  const ready = useReady();
  if (!ready) return <div className="h-64" />;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <CartesianGrid stroke="var(--rule)" vertical={false} />
          <XAxis dataKey="m" tick={{ fill: "var(--mist)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--mist)", fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip {...tip} cursor={{ fill: "var(--card-2)" }} />
          <Bar dataKey="inn" name="Entrées" fill="var(--sage)" />
          <Bar dataKey="out" name="Sorties" fill="var(--copper)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const SLICE = ["var(--copper)", "var(--sage)", "var(--mist)", "var(--clay)", "var(--ink)"];

export function SplitChart({ data }: { data: { name: string; value: number }[] }) {
  const ready = useReady();
  const top = data.slice(0, 5);
  if (!ready) return <div className="h-52" />;
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={top} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} stroke="var(--canvas)" paddingAngle={2}>
            {top.map((entry, i) => (
              <Cell key={entry.name} fill={SLICE[i % SLICE.length]} />
            ))}
          </Pie>
          <Tooltip {...tip} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
