"use client";

import { intlFormatDistance } from "date-fns";
import { useEffect, useMemo, useState } from "react";

type RelativeTimeProps = {
  value?: string | Date | null;
  className?: string;
  fallback?: string;
};

const REFRESH_INTERVAL_MS = 30_000;

function getValidDate(value?: string | Date | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function RelativeTime({
  value,
  className,
  fallback = "—",
}: RelativeTimeProps) {
  const date = useMemo(() => getValidDate(value), [value]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (!date) {
    return <>{fallback}</>;
  }

  const isoTimestamp = date.toISOString();
  const relativeLabel = intlFormatDistance(date, now, {
    numeric: "always",
    style: "long",
  });

  return (
    <time
      dateTime={isoTimestamp}
      title={isoTimestamp}
      suppressHydrationWarning
      className={className}
    >
      {relativeLabel}
    </time>
  );
}
