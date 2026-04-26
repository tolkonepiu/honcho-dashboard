type JsonCellProps = {
  value: Record<string, unknown>;
};

export function JsonCell({ value }: JsonCellProps) {
  const hasEntries = Object.keys(value).length > 0;

  if (!hasEntries) {
    return <span className="text-[var(--text-dim)]">—</span>;
  }

  return (
    <code className="block max-w-xs truncate font-mono text-xs text-[var(--text-muted)]">
      {JSON.stringify(value)}
    </code>
  );
}
