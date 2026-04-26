"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { TableRefreshButton } from "@/components/ui/table-controls";
import { TypedConfirmationDialog } from "@/components/ui/typed-confirmation-dialog";
import { dispatchPageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { getApiErrorMessage } from "@/lib/api-client";

type DeleteAction = {
  entityId: string;
  entityLabel: string;
  apiPath: string;
  redirectTo: string;
};

type PageHeaderActionsProps = {
  refreshLabel: string;
  deleteAction?: DeleteAction;
};

const deleteTriggerClass =
  "inline-flex h-8 w-8 items-center justify-center text-[color:color-mix(in_srgb,var(--color-danger)_80%,transparent)] transition-colors hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:text-[var(--text-dim)]";

export function PageHeaderActions({
  refreshLabel,
  deleteAction,
}: PageHeaderActionsProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onRefresh = () => {
    dispatchPageRefreshSignal();
    startRefresh(() => {
      router.refresh();
    });
  };

  const onOpenDeleteDialog = () => {
    setConfirmValue("");
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const onCloseDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setConfirmValue("");
    setDeleteError(null);
    setIsDeleteDialogOpen(false);
  };

  const onConfirmDelete = async () => {
    if (!deleteAction) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(deleteAction.apiPath, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            `Failed to delete ${deleteAction.entityLabel.toLowerCase()} (${response.status}).`,
          ),
        );
      }

      setIsDeleteDialogOpen(false);
      router.push(deleteAction.redirectTo);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : `Failed to delete ${deleteAction.entityLabel.toLowerCase()}.`,
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const isDeleteDisabled =
    !deleteAction || confirmValue !== deleteAction.entityId;

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        {deleteAction ? (
          <button
            type="button"
            onClick={onOpenDeleteDialog}
            className={deleteTriggerClass}
            aria-label={`Delete ${deleteAction.entityLabel.toLowerCase()}`}
            title={`Delete ${deleteAction.entityLabel.toLowerCase()}`}
          >
            <i aria-hidden className={cn("hn hn-trash ui-icon-md")} />
          </button>
        ) : null}

        <TableRefreshButton
          isPending={isRefreshing}
          onRefresh={onRefresh}
          label={refreshLabel}
        />
      </div>

      {deleteAction ? (
        <TypedConfirmationDialog
          isOpen={isDeleteDialogOpen}
          title={`Delete ${deleteAction.entityLabel}`}
          description={`This action cannot be undone. Deleting this ${deleteAction.entityLabel.toLowerCase()} will permanently remove it.`}
          expectedValue={deleteAction.entityId}
          typedValue={confirmValue}
          onTypedValueChange={(value) => {
            setConfirmValue(value);
            if (deleteError) {
              setDeleteError(null);
            }
          }}
          onCancel={onCloseDeleteDialog}
          onConfirm={() => {
            void onConfirmDelete();
          }}
          confirmLabel="Delete"
          pendingLabel="Deleting..."
          isPending={isDeleting}
          isConfirmDisabled={isDeleteDisabled}
          error={deleteError}
        />
      ) : null}
    </>
  );
}
