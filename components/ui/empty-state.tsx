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
        "rounded-xl border border-dashed border-ctp-surface1 bg-ctp-mantle/70 px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-ctp-surface1 bg-ctp-crust text-ctp-subtext0">
            {icon}
          </div>
        ) : null}

        <h2 className="text-lg font-semibold tracking-tight text-ctp-text">
          {title}
        </h2>

        {description ? (
          <p className="text-sm text-ctp-subtext0">{description}</p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </section>
  );
}
