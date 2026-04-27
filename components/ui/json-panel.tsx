import { Surface } from "@/components/ui/surface";

type JsonPanelProps = {
  title: string;
  value: Record<string, unknown>;
};

export function JsonPanel({ title, value }: JsonPanelProps) {
  if (Object.keys(value).length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="ui-section-label">{title}</h2>

      <Surface className="overflow-hidden">
        <pre className="overflow-x-auto p-4 font-mono text-xs leading-5 break-words whitespace-pre-wrap text-[var(--text-secondary)] sm:px-6">
          {JSON.stringify(value, null, 2)}
        </pre>
      </Surface>
    </section>
  );
}
