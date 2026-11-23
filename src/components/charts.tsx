import { useEffect, useRef, useState } from "react";
import { cn, money } from "@/lib/utils";

/**
 * Two charts, drawn by hand.
 *
 * These used to come from recharts: 396 KB of JavaScript for a grouped bar
 * chart and a donut. Both fit in a page of DOM/SVG, render on the server (so
 * there is no blank flash while a chart library boots), inherit the theme
 * tokens with no colour plumbing, and can be styled to match the rest of the
 * app — rounded caps, hairline grid, tabular figures.
 *
 * Every chart is a figure with a screen-reader table behind it: the numbers
 * are never only visual.
 */

/** Rounds an axis maximum up to a readable step (100, 500, 1 000, 2 500 …). */
function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => value <= s * 4);
  return (step ?? magnitude * 10) * 4;
}

function compact(n: number) {
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10} k€`;
  return `${Math.round(n)} €`;
}

export function FlowChart({ data }: { data: { m: string; inn: number; out: number }[] }) {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const max = niceMax(Math.max(...data.flatMap((d) => [d.inn, d.out]), 0));
  const ticks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <figure className="rounded-3xl border border-rule bg-card/70 p-4 sm:p-5">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-mist">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-sage" />
            Entrées
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-copper" />
            Sorties
          </span>
        </div>
        <span className="text-xs text-mist">{data.length} derniers mois affichés</span>
      </figcaption>

      <div className="mt-5 flex gap-3">
        <div className="flex h-44 flex-col justify-between pt-0.5 text-[11px] tabular-nums text-mist">
          {ticks.map((t) => (
            <span key={t} className="leading-none">
              {t === 0 ? "0" : compact(max * t)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <span key={t} className="h-px w-full bg-rule/70 last:bg-rule" />
            ))}
          </div>

          <div className="relative flex h-44 items-end justify-between gap-1 sm:gap-3">
            {data.map((d, index) => {
              const on = hover === d.m;
              return (
                <div
                  key={d.m}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
                  onMouseEnter={() => setHover(d.m)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(d.m)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.m} : ${money(d.inn)} d’entrées, ${money(d.out)} de sorties`}
                >
                  <div className="flex h-full items-end justify-center gap-[2px] sm:gap-1">
                    <span
                      className={cn(
                        "w-full max-w-4 rounded-t-md bg-sage/85 transition-[height,background-color] duration-500 ease-out",
                        on && "bg-sage",
                      )}
                      style={{
                        height: mounted ? `${(d.inn / max) * 100}%` : "0%",
                        transitionDelay: "40ms",
                      }}
                    />
                    <span
                      className={cn(
                        "w-full max-w-4 rounded-t-md bg-copper/80 transition-[height,background-color] duration-500 ease-out",
                        on && "bg-copper",
                      )}
                      style={{
                        height: mounted ? `${(d.out / max) * 100}%` : "0%",
                        transitionDelay: `${75 + index * 55}ms`,
                      }}
                    />
                  </div>
                  {on ? (
                    <div className="pointer-events-none absolute -top-1 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-rule bg-card px-2.5 py-1.5 text-xs shadow-lift">
                      <p className="font-medium">{d.m}</p>
                      <p className="tabular-nums text-sage">+{money(d.inn)}</p>
                      <p className="tabular-nums text-copper">−{money(d.out)}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between gap-1 text-[11px] text-mist sm:gap-3">
            {data.map((d) => (
              <span
                key={d.m}
                className={cn("min-w-0 flex-1 truncate text-center", hover === d.m && "text-ink")}
              >
                {d.m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Entrées et sorties par mois</caption>
        <thead>
          <tr>
            <th scope="col">Mois</th>
            <th scope="col">Entrées</th>
            <th scope="col">Sorties</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.m}>
              <th scope="row">{d.m}</th>
              <td>{money(d.inn)}</td>
              <td>{money(d.out)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const SLICE = ["var(--copper)", "var(--teal)", "var(--sage)", "var(--clay)", "var(--mist)"];

export function SplitChart({ data }: { data: { name: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(id);
  }, []);
  const top = data.slice(0, 5);
  const total = top.reduce((s, d) => s + d.value, 0);
  const R = 54;
  const C = 2 * Math.PI * R;
  let offset = 0;

  if (total <= 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-rule text-sm text-mist">
        Aucune sortie sur ce mois.
      </div>
    );
  }

  return (
    <figure className="flex flex-col items-center gap-4 rounded-3xl border border-rule bg-card/70 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 140 140"
          className="size-36 -rotate-90"
          role="img"
          aria-label="Répartition des sorties"
        >
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--card-2)" strokeWidth="16" />
          {top.map((slice, i) => {
            const share = slice.value / total;
            const dash = share * C;
            const el = (
              <circle
                key={slice.name}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={SLICE[i % SLICE.length]}
                strokeWidth={hover === i ? 20 : 16}
                strokeDasharray={`${drawn ? Math.max(dash - 2, 0) : 0} ${C}`}
                strokeDashoffset={drawn ? -offset : -offset + dash}
                strokeLinecap="butt"
                style={{
                  transition: `stroke-dasharray 620ms var(--ease-soft) ${i * 90}ms, stroke-dashoffset 620ms var(--ease-soft) ${i * 90}ms, stroke-width 200ms ease, opacity 200ms ease`,
                }}
                opacity={hover === null || hover === i ? 1 : 0.35}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-mist">
            {hover === null ? "Total" : top[hover].name}
          </span>
          <span className="font-serif text-xl tabular-nums">
            {hover === null ? money(total) : money(top[hover].value)}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-1.5">
        {top.map((slice, i) => (
          <li key={slice.name}>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-xl px-2 py-1 text-left text-sm transition-colors",
                hover === i && "bg-card-2",
              )}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: SLICE[i % SLICE.length] }}
              />
              <span className="min-w-0 flex-1 truncate">{slice.name}</span>
              {/* Percentage is decoration; drop it before squeezing the name. */}
              <span className="hidden shrink-0 tabular-nums text-mist sm:inline">
                {Math.round((slice.value / total) * 100)} %
              </span>
              <span className="shrink-0 text-right tabular-nums">{money(slice.value)}</span>
            </button>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>Répartition des sorties par catégorie</caption>
        <tbody>
          {top.map((slice) => (
            <tr key={slice.name}>
              <th scope="row">{slice.name}</th>
              <td>{money(slice.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Kept for callers that want the old signature without the extra markup. */
export function Sparkline({ values }: { values: number[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="h-8 w-full"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--copper)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
