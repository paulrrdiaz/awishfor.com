import type { ReactNode } from "react";

type Props = {
	primary: ReactNode;
	secondary?: ReactNode;
};

export function MobileActionBar({ primary, secondary }: Props) {
	return (
		<div className="flex shrink-0 flex-col gap-2 border-border border-t bg-card px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden">
			{secondary}
			{primary}
		</div>
	);
}
