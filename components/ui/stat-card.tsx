import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Surface } from "@/components/ui/surface";

type StatCardProps = {
  label: string;
  value: ReactNode;
  className?: string;
  href?: string;
  valueClassName?: string;
};

export function StatCard({
  label,
  value,
  className,
  href,
  valueClassName,
}: StatCardProps) {
  const content = (
    <>
      <dt className="ui-section-label">{label}</dt>
      <dd className={cn("mt-2 text-xl font-semibold text-[var(--text-primary)]", valueClassName)}>
        {value}
      </dd>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="ui-surface-hover-link block">
        <Surface
          className={cn(
            "ui-surface-hover-target p-4",
            className,
          )}
        >
          {content}
        </Surface>
      </Link>
    );
  }

  return (
    <Surface className={cn("p-4", className)}>
      {content}
    </Surface>
  );
}
