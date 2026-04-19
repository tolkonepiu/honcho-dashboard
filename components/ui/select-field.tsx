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
    <label className="space-y-1 text-xs font-medium text-ctp-subtext0">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-ctp-surface1 bg-ctp-crust px-3 py-2 text-sm text-ctp-text outline-none transition-colors focus:border-ctp-lavender focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle"
      >
        {children}
      </select>
    </label>
  );
}
