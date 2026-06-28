import { PublicWishlistPage } from "@/components/layouts/public-wishlist/public-wishlist-page";
import { DEMO_WISHLIST } from "@/config/demo-wishlist";

export function ExamplePreview() {
	return (
		<section
			className="border-[var(--mline)] border-t bg-white px-11 py-[76px] text-center"
			id="ejemplo"
		>
			<div data-reveal>
				<div className="m-eyebrow mb-3">Un ejemplo real</div>
				<h2 className="m-serif mb-2 font-semibold text-[38px]">
					Así se ve una wishlist publicada
				</h2>
				<p className="mb-8 text-[15px] text-[var(--mmut)]">
					Construida con los mismos componentes públicos, en modo compacto.
				</p>
			</div>
			<div
				className="m-card mx-auto max-w-[820px] overflow-hidden text-left"
				data-reveal
				style={{ boxShadow: "0 20px 60px rgba(60,40,20,.1)" }}
			>
				<PublicWishlistPage mode="compact" wishlist={DEMO_WISHLIST} />
			</div>
		</section>
	);
}
