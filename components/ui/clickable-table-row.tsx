"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ClickableTableRowProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, summary, [role='button'], [role='link'], [data-row-click-ignore='true']";

function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null
  );
}

export function ClickableTableRow({
  href,
  children,
  className,
}: ClickableTableRowProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey ||
      isInteractiveTarget(event.target)
    ) {
      return;
    }

    if (window.getSelection()?.toString()) {
      return;
    }

    router.push(href);
  };

  return (
    <tr
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-interactive)_40%,transparent)]",
        className,
      )}
    >
      {children}
    </tr>
  );
}
