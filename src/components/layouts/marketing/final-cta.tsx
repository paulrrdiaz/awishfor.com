import Link from "next/link";

export function FinalCta() {
	return (
		<section
			className="relative overflow-hidden px-11 py-[92px] text-center"
			style={{
				background: "linear-gradient(150deg,#1B4A30,#0F3320 60%,#0A2218)",
			}}
		>
			<div
				className="m-blob"
				data-float
				style={{
					width: 320,
					height: 320,
					background: "#3A8A54",
					filter: "blur(90px)",
					opacity: 0.38,
					top: -100,
					right: "20%",
				}}
			/>
			<div
				className="m-blob"
				data-float-rev
				style={{
					width: 220,
					height: 220,
					background: "#BCE25A",
					filter: "blur(70px)",
					opacity: 0.2,
					bottom: -60,
					left: "12%",
				}}
			/>
			<div
				className="m-blob"
				data-float-3
				style={{
					width: 140,
					height: 140,
					background: "#7FB069",
					filter: "blur(50px)",
					opacity: 0.25,
					top: "20%",
					left: "5%",
				}}
			/>
			<div
				className="pointer-events-none absolute text-[28px] opacity-70"
				data-float
				style={{ top: 32, left: "11%" }}
			>
				🎁
			</div>
			<div
				className="pointer-events-none absolute text-[26px] opacity-70"
				data-float-rev
				style={{ bottom: 36, right: "13%" }}
			>
				🌿
			</div>
			<div
				className="pointer-events-none absolute text-[20px] opacity-60"
				data-float-3
				style={{ top: 64, right: "7%" }}
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
