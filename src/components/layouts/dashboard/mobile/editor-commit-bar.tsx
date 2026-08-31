import { Button } from "@/components/ui/button";

type Props = {
	onDiscard: () => void;
	onSave: () => void;
	saveLabel: string;
	saveDisabled?: boolean;
	discardDisabled?: boolean;
};

export function EditorCommitBar({
	onDiscard,
	onSave,
	saveLabel,
	saveDisabled,
	discardDisabled,
}: Props) {
	return (
		<div className="sticky bottom-0 -mx-7 mt-8 flex shrink-0 gap-2 border-border border-t bg-card px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
			<Button
				className="flex-1"
				disabled={discardDisabled}
				onClick={onDiscard}
				type="button"
				variant="outline"
			>
				Descartar
			</Button>
			<Button
				className="flex-1"
				disabled={saveDisabled}
				onClick={onSave}
				type="button"
			>
				{saveLabel}
			</Button>
		</div>
	);
}
