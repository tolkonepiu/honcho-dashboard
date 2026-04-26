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
    <label className="ui-section-label space-y-1">
      {label}
      <select
        value={value}
        onChange={onChange}
        className="ui-input normal-case focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)]"
      >
        {children}
      </select>
    </label>
  );
}
