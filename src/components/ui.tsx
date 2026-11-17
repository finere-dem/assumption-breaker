import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { EvidenceSignal } from "@/lib/agent/schemas";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-ink text-paper hover:bg-ink/85 disabled:bg-ink/30",
    secondary: "border border-line bg-paper hover:bg-muted disabled:opacity-40",
    ghost: "text-ink/70 hover:text-ink hover:bg-muted disabled:opacity-40",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export function Checkpoint({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-human/30 bg-human/8 p-4 text-sm leading-relaxed">
      <span aria-hidden className="mt-0.5 text-base">
        ✋
      </span>
      <p>{children}</p>
    </div>
  );
}

const SIGNAL_STYLE: Record<EvidenceSignal, string> = {
  insufficient: "bg-muted text-ink/70",
  "leans-supported": "bg-pro/12 text-pro",
  "leans-contradicted": "bg-con/12 text-con",
  mixed: "bg-amber-500/15 text-amber-700",
};

export function SignalBadge({ signal, label }: { signal: EvidenceSignal; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SIGNAL_STYLE[signal]}`}>
      {label}
    </span>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-ink/70" role="status">
      <span className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      {label}
    </div>
  );
}

export function ErrorBox({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-con/30 bg-con/8 p-4 text-sm">
      <span>{message}</span>
      <Button variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
