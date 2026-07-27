import { cn } from "@/lib/utils";

function getStrength(password: string): 0 | 1 | 2 | 3 {
	if (!password) return 0;
	let score = 0;
	if (password.length >= 8) score++;
	if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
	if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
	return score as 0 | 1 | 2 | 3;
}

const STRENGTH_COLOR = [
	"bg-border",
	"bg-destructive",
	"bg-amber-400",
	"bg-primary",
];

export function PasswordStrengthMeter({ password }: { password: string }) {
	const strength = getStrength(password);
	return (
		<div className="flex gap-1.5" role="presentation">
			{[1, 2, 3].map((segment) => (
				<div
					className={cn(
						"h-1 flex-1 rounded-full",
						segment <= strength ? STRENGTH_COLOR[strength] : "bg-border",
					)}
					key={segment}
				/>
			))}
		</div>
	);
}
