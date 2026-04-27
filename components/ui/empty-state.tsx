import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <Surface as="section" className={cn("px-5 py-8 text-center", className)}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        {icon ? (
          <div className="ui-surface-subtle flex h-10 w-10 items-center justify-center text-[var(--text-muted)]">
            {icon}
          </div>
        ) : null}

        <h2 className="ui-title">{title}</h2>

        {description ? (
          <p className="text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}

        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </Surface>
  );
}
