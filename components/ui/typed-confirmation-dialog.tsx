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
  "inline-flex h-8 items-center justify-center rounded-md border border-ctp-surface1 px-3 text-xs font-medium text-ctp-subtext0 transition-colors hover:bg-ctp-surface0 hover:text-ctp-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:text-ctp-overlay0";

const dangerButtonClass =
  "inline-flex h-8 items-center justify-center rounded-md border border-ctp-red/50 bg-ctp-red/20 px-3 text-xs font-semibold text-ctp-red transition-colors hover:bg-ctp-red/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:bg-ctp-surface0 disabled:text-ctp-overlay0";

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
        className="w-full max-w-md rounded-xl border border-ctp-surface0 bg-ctp-mantle p-5 shadow-xl"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <h2 id={titleId} className="text-base font-semibold text-ctp-text">
              {title}
            </h2>
            <p id={descriptionId} className="text-sm text-ctp-subtext0">
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-ctp-subtext0">
              Enter this exact ID to enable deletion:
            </p>
            <p className="rounded-md border border-ctp-surface0 bg-ctp-crust px-3 py-2 font-mono text-xs text-ctp-text">
              {expectedValue}
            </p>
            <label
              htmlFor={inputId}
              className="block text-xs font-medium text-ctp-subtext0"
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
              className="w-full rounded-md border border-ctp-surface1 bg-ctp-crust px-3 py-2 text-sm text-ctp-text outline-none transition-colors focus:border-ctp-lavender focus-visible:ring-2 focus-visible:ring-ctp-lavender/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle"
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
