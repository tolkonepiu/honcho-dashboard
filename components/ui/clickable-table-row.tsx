"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type ClickableTableRowProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

const INTERACTIVE_SELECTOR =
  "a, button, input, select, textarea, summary, [role='button'], [role='link'], [data-row-click-ignore='true']";

function buildClassName(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

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
      className={buildClassName(
        "cursor-pointer transition-colors hover:bg-ctp-surface0/40",
        className,
      )}
    >
      {children}
    </tr>
  );
}
