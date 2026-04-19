type JsonCellProps = {
  value: Record<string, unknown>;
};

export function JsonCell({ value }: JsonCellProps) {
  const hasEntries = Object.keys(value).length > 0;

  if (!hasEntries) {
    return <span className="text-ctp-overlay0">—</span>;
  }

  return (
    <code className="block max-w-xs truncate font-mono text-xs text-ctp-subtext0">
      {JSON.stringify(value)}
    </code>
  );
}
