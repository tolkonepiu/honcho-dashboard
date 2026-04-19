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
    <span className="rounded-md border border-ctp-green/40 bg-ctp-green/15 px-2 py-1 font-medium text-ctp-green">
      Copied
    </span>
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
        <span className="font-semibold uppercase tracking-[0.1em] text-ctp-subtext1">
          ID
        </span>
        <span className="font-mono text-ctp-subtext0">{id}</span>
      </button>

      <CopyFeedback isCopied={copiedId === id} />
    </>
  );
}
