import { MarketingNav } from "@/components/layouts/marketing/marketing-nav";
import { MarketingShell } from "@/components/layouts/marketing/marketing-shell";
import { GiftEscapedArt } from "@/components/shared/gift-escaped-art";

export default function NotFound() {
	return (
		<div className="marketing-theme min-h-svh">
			<MarketingShell>
				<MarketingNav />
				<main className="relative overflow-hidden px-6 py-16 text-center md:px-11 md:py-24">
					<GiftEscapedArt
						confettiColors={["#BCE25A", "#F4C84A", "#56A86B"]}
						fillColor="#BCE25A"
						ribbonColor="#ffffff"
						variant="marketing"
					/>
					<div className="relative mx-auto mt-2 max-w-[560px]">
						<p className="mb-3.5 font-mono text-[12px] text-[var(--mmut)] uppercase tracking-[0.16em]">
							Error 404 · Página no encontrada
						</p>
						<h1 className="m-serif font-semibold text-[30px] leading-tight tracking-tight md:text-[46px]">
							Se nos escapó esta página
						</h1>
						<p className="mt-4 text-[14px] text-[var(--mmut)] leading-relaxed md:text-[16px]">
							Buscamos por todas partes y no dimos con ella. Puede que el enlace
							esté incompleto o que la página se haya mudado.
						</p>
						<div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
							<a className="m-btn m-btn-glow m-btn-lime" href="/">
								Volver al inicio
							</a>
							<a
								className="m-btn border border-[var(--mline)] bg-white text-[var(--mink)]"
								href="/#ejemplo"
							>
								Ver un ejemplo
							</a>
						</div>
					</div>
				</main>
			</MarketingShell>
		</div>
	);
}
