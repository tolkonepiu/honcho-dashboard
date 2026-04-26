"use client";

import { type FormEvent, useEffect, useId, useRef } from "react";
import { dangerButtonClass, subtleButtonClass } from "@/components/ui/button-styles";
import { Surface } from "@/components/ui/surface";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--surface-overlay)] p-4"
    >
      <Surface
        as="section"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md p-4"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <h2 id={titleId} className="ui-title">
              {title}
            </h2>
            <p id={descriptionId} className="text-xs leading-5 text-[var(--text-muted)]">
              {description}
            </p>
          </div>

          <div className="space-y-2">
            <p className="ui-section-label">
              Enter this exact ID to enable deletion:
            </p>
            <p className="ui-surface-subtle ui-compact-text px-2.5 py-2 font-mono text-[var(--text-primary)]">
              {expectedValue}
            </p>
            <label
              htmlFor={inputId}
              className="ui-section-label block"
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
              className="ui-input focus-visible:ring-2 focus-visible:ring-[color:color-mix(in_srgb,var(--color-accent)_70%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)]"
            />
          </div>

          {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className={subtleButtonClass}
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
      </Surface>
    </div>
  );
}
