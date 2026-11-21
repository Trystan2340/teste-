import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { TxKind } from "@/lib/freev/data";
import { cn, money, signed } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "quiet";
type ButtonSize = "md" | "sm";

/**
 * Button classes. One `cva()` call was the only reason the app carried
 * class-variance-authority; a lookup table does the same job in six lines and
 * keeps the same API (`variant`, `size`, defaults).
 */
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-[var(--dur-1)] ease-[var(--ease-soft)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-copper bg-copper text-copper-ink hover:brightness-110",
  ghost: "border-rule bg-card text-ink shadow-float hover:border-copper/30 hover:text-copper",
  quiet: "border-transparent bg-transparent px-0 text-mist shadow-none hover:text-ink",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "h-10 px-4",
  sm: "h-9 px-3 text-xs",
};

const buttonStyles = ({
  variant = "ghost",
  size = "md",
}: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
}) => `${BUTTON_BASE} ${BUTTON_VARIANTS[variant ?? "ghost"]} ${BUTTON_SIZES[size ?? "md"]}`;

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

/** Compact text input for inline forms outside a dialog. */
export function InlineInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-full border border-transparent bg-card-2/70 px-3 text-sm text-ink outline-none transition-colors placeholder:text-mist focus:border-copper/40",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs uppercase tracking-widest text-mist">{label}</span>
      <input
        className="mt-1 w-full border-0 border-b border-rule bg-transparent py-2 text-sm text-ink outline-none placeholder:text-mist focus:border-copper"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-clay">{hint}</span> : null}
    </label>
  );
}

export function Area({
  label,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs uppercase tracking-widest text-mist">{label}</span>
      <textarea
        className="mt-1 w-full resize-none border-0 border-b border-rule bg-transparent py-2 text-sm text-ink outline-none focus:border-copper"
        rows={3}
        {...props}
      />
    </label>
  );
}

export function Select({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs uppercase tracking-widest text-mist">{label}</span>
      <select
        className="mt-1 w-full border-0 border-b border-rule bg-transparent py-2 text-sm text-ink outline-none focus:border-copper"
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-6 w-11 rounded-full border transition-colors",
        on ? "border-copper bg-copper" : "border-rule bg-card-2",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full transition-transform",
          on ? "translate-x-6 bg-copper-ink" : "translate-x-0.5 bg-mist",
        )}
      />
    </button>
  );
}

export function PageHead({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 pb-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-copper">{kicker}</p>
        <h1 className="mt-1 font-serif text-4xl leading-none tracking-tight text-ink">{title}</h1>
        {lede ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{lede}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "sage" | "clay" | "mist";
}) {
  return (
    <div className="px-4 py-5 first:pl-0 last:pr-0">
      <p className="text-xs uppercase tracking-widest text-mist">{label}</p>
      <p className="mt-2 font-serif text-3xl tabular-nums text-ink">{value}</p>
      {note ? (
        <p
          className={cn(
            "mt-1 text-sm",
            tone === "sage" && "text-sage",
            tone === "clay" && "text-clay",
            (!tone || tone === "mist") && "text-mist",
          )}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function Amount({ value, kind }: { value: number; kind?: TxKind }) {
  if (kind === "transfer") {
    return <span className="tabular-nums text-mist">{money(value)}</span>;
  }
  return (
    <span className={cn("tabular-nums", value > 0 && "text-sage", value < 0 && "text-clay")}>
      {signed(value)}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-rule bg-card/60 px-4 py-10 text-center">
      <p className="font-serif text-2xl">{title}</p>
      <p className="mt-2 text-sm text-mist">{body}</p>
    </div>
  );
}
