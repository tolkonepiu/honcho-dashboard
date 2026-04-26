import { Badge } from "@/components/ui/badge";
import { metadataButtonClass } from "@/components/ui/button-styles";

type CopyIdButtonProps = {
  id: string;
  copiedId: string | null;
  onCopy: (id: string) => void;
};

export function CopyFeedback({ isCopied }: { isCopied: boolean }) {
  if (!isCopied) {
    return null;
  }

  return (
    <Badge variant="success" className="ui-compact-label ui-compact-text">
      Copied
    </Badge>
  );
}

export function CopyIdButton({ id, copiedId, onCopy }: CopyIdButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          onCopy(id);
        }}
        className={metadataButtonClass}
      >
        <span className="ui-compact-kicker">
          ID
        </span>
        <span className="font-mono text-[var(--text-muted)]">{id}</span>
      </button>

      <CopyFeedback isCopied={copiedId === id} />
    </>
  );
}
