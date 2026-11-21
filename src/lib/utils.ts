import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number, digits?: number) {
  const rounded = Math.round(n * 100) / 100;
  const use = Number.isInteger(rounded) ? 0 : 2;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits ?? use,
    maximumFractionDigits: digits ?? use,
  }).format(n);
}

export function signed(n: number) {
  const formatted = money(Math.abs(n));
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `−${formatted}`;
  return formatted;
}

export function pct(n: number) {
  const body = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(n);
  return `${body} %`;
}

export function dayLabel(iso: string) {
  return format(parseISO(iso), "d MMM", { locale: fr });
}

/** "novembre 2026" / "nov." for a `YYYY-MM` key, capitalised the French way. */
export function monthName(iso: string, style: "long" | "short" = "long") {
  const raw = format(parseISO(`${iso}-01`), style === "long" ? "MMMM yyyy" : "MMM", {
    locale: fr,
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function monthLabel(iso: string) {
  return format(parseISO(`${iso}-01`), "MMMM yyyy", { locale: fr });
}
export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}
