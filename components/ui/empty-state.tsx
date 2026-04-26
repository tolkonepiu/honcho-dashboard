import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

function buildClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={buildClassName(
        "border-2 border-[var(--pixel-border)] bg-ctp-mantle px-5 py-8 text-center shadow-[var(--pixel-shadow-md)]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center border-2 border-[var(--pixel-border)] bg-ctp-crust text-ctp-subtext0 shadow-[var(--pixel-shadow-sm)]">
            {icon}
          </div>
        ) : null}

        <h2 className="text-sm font-semibold uppercase tracking-[0.06em] text-ctp-text">
          {title}
        </h2>

        {description ? (
          <p className="text-xs leading-5 text-ctp-subtext0">{description}</p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </section>
  );
}
