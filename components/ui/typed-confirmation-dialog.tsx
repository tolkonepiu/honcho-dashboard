"use client";

import { type FormEvent, useEffect, useId, useRef } from "react";

type TypedConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  description: string;
  expectedValue: string;
  typedValue: string;
  onTypedValueChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  isConfirmDisabled: boolean;
  error: string | null;
};

const secondaryButtonClass =
  "inline-flex h-8 items-center justify-center border border-[var(--pixel-border)] bg-ctp-crust px-3 text-xs font-semibold uppercase tracking-[0.05em] text-ctp-subtext0 shadow-[var(--pixel-shadow-sm)] transition-colors hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:bg-ctp-surface0 disabled:text-ctp-overlay0 disabled:shadow-none";

const dangerButtonClass =
  "inline-flex h-8 items-center justify-center border border-ctp-red bg-ctp-red/20 px-3 text-xs font-semibold uppercase tracking-[0.05em] text-ctp-red shadow-[var(--pixel-shadow-sm)] transition-colors hover:bg-ctp-red/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:bg-ctp-surface0 disabled:text-ctp-overlay0 disabled:shadow-none";

export function TypedConfirmationDialog({
  isOpen,
  title,
  description,
  expectedValue,
  typedValue,
  onTypedValueChange,
  onCancel,
  onConfirm,
  confirmLabel,
  pendingLabel,
  isPending,
  isConfirmDisabled,
  error,
}: TypedConfirmationDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const inputId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isPending) {
        return;
      }

      event.preventDefault();
      onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) {
    return null;
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isConfirmDisabled || isPending) {
      return;
    }

    onConfirm();
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-base/80 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md border-2 border-[var(--pixel-border)] bg-ctp-mantle p-4 shadow-[var(--pixel-shadow-md)]"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <h2
              id={titleId}
              className="text-sm font-semibold uppercase tracking-[0.06em] text-ctp-text"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="text-xs leading-5 text-ctp-subtext0"
            >
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.05em] text-ctp-subtext0">
              Enter this exact ID to enable deletion:
            </p>
            <p className="border-2 border-[var(--pixel-border)] bg-ctp-crust px-2.5 py-2 font-mono text-[11px] text-ctp-text shadow-[var(--pixel-shadow-sm)]">
              {expectedValue}
            </p>
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold uppercase tracking-[0.05em] text-ctp-subtext0"
            >
              Confirm ID
            </label>
            <input
              id={inputId}
              ref={inputRef}
              type="text"
              value={typedValue}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onChange={(event) => {
                onTypedValueChange(event.target.value);
              }}
              className="w-full border-2 border-[var(--pixel-border)] bg-ctp-crust px-2.5 py-2 text-sm text-ctp-text shadow-[var(--pixel-shadow-sm)] outline-none transition-colors focus:border-ctp-lavender focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle"
            />
          </div>

          {error ? <p className="text-xs text-ctp-red">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={secondaryButtonClass}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConfirmDisabled || isPending}
              className={dangerButtonClass}
            >
              {isPending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
