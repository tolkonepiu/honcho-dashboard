import { EmptyState } from "@/components/ui/empty-state";

type HonchoErrorStateProps = {
  message: string;
};

export function HonchoErrorState({ message }: HonchoErrorStateProps) {
  return (
    <EmptyState title="Unable to load Honcho data" description={message} />
  );
}
