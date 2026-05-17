"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} theme`
    : "Toggle theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)] focus-visible:outline-none"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        <i
          aria-hidden
          className={`hn ${isDark ? "hn-moon" : "hn-sun"} ui-icon-lg`}
        />
      ) : (
        <i aria-hidden className="hn hn-themes ui-icon-lg" />
      )}
    </button>
  );
}
