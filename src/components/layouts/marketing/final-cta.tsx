import Link from "next/link";

export function FinalCta() {
	return (
		<section className="relative m-cta-bg overflow-hidden px-11 py-[92px] text-center">
			<div
				className="-top-[100px] right-[20%] m-blob h-[320px] w-[320px] bg-[#3A8A54] opacity-[0.38] blur-[90px]"
				data-float
			/>
			<div
				className="-bottom-[60px] left-[12%] m-blob h-[220px] w-[220px] bg-[#BCE25A] opacity-20 blur-[70px]"
				data-float-rev
			/>
			<div
				className="top-[20%] left-[5%] m-blob h-[140px] w-[140px] bg-[#7FB069] opacity-25 blur-[50px]"
				data-float-3
			/>
			<div
				className="pointer-events-none absolute top-[32px] left-[11%] text-[28px] opacity-70"
				data-float
			>
				🎁
			</div>
			<div
				className="pointer-events-none absolute right-[13%] bottom-[36px] text-[26px] opacity-70"
				data-float-rev
			>
				🌿
			</div>
			<div
				className="pointer-events-none absolute top-[64px] right-[7%] text-[20px] opacity-60"
				data-float-3
			>
				✨
			</div>

			<div className="relative" data-reveal>
				<h2 className="m-serif mx-auto mb-[18px] max-w-[680px] font-semibold text-[52px] text-white leading-[1.07]">
					Tu próximo momento especial merece una página hermosa.
				</h2>
				<p className="mb-[34px] text-[17px] text-[rgba(255,255,255,0.75)] leading-[1.6]">
					Crea tu wishlist en minutos. Es gratis y se siente bonito. 🌿
				</p>
				<Link
					className="!px-10 !py-[17px] !text-[16px] m-btn m-btn-lime"
					data-glow
					href="/create"
				>
					Crear mi wishlist →
				</Link>
			</div>
		</section>
	);
}
