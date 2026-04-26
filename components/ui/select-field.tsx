import type { ChangeEventHandler, ReactNode } from "react";

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  children: ReactNode;
};

export function SelectField({
  label,
  value,
  onChange,
  children,
}: SelectFieldProps) {
  return (
    <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.05em] text-ctp-subtext0">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="w-full border-2 border-[var(--pixel-border)] bg-ctp-crust px-2.5 py-2 text-sm normal-case text-ctp-text shadow-[var(--pixel-shadow-sm)] outline-none transition-colors focus:border-ctp-lavender focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle"
      >
        {children}
      </select>
    </label>
  );
}
