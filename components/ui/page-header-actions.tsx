"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api-client";
import { dispatchPageRefreshSignal } from "@/hooks/use-page-refresh-signal";
import { TableRefreshButton } from "@/components/ui/table-controls";
import { TypedConfirmationDialog } from "@/components/ui/typed-confirmation-dialog";

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
  "inline-flex h-7 w-7 items-center justify-center rounded-md border border-ctp-red/50 bg-ctp-red/15 text-ctp-red transition-colors hover:bg-ctp-red/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-red/70 focus-visible:ring-offset-1 focus-visible:ring-offset-ctp-mantle disabled:cursor-not-allowed disabled:border-ctp-surface0 disabled:bg-ctp-surface0 disabled:text-ctp-overlay0";

function TrashIcon() {
  return (
    <svg
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      className="h-4 w-4"
    >
      <title>Delete</title>
      <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" />
    </svg>
  );
}

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

  const isDeleteDisabled = !deleteAction || confirmValue !== deleteAction.entityId;

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
            <TrashIcon />
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
