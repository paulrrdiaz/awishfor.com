import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/config/contact";

export const metadata: Metadata = {
	title: "Privacidad · A Wish For",
	description: "Política de privacidad de A Wish For.",
};

export default function PrivacyPage() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-16 text-[var(--mink)]">
			<h1 className="m-serif mb-2 font-semibold text-[36px]">
				Política de privacidad
			</h1>
			<p className="mb-10 text-[var(--mmut)] text-sm">
				Última actualización: junio de 2025
			</p>

			<section className="space-y-8 text-[15px] leading-[1.75]">
				<div>
					<h2 className="mb-3 font-semibold text-[18px]">1. Quiénes somos</h2>
					<p>
						A Wish For (<strong>awishfor.com</strong>) es una plataforma para
						crear y compartir listas de deseos. Tratamos los datos personales de
						acuerdo con esta política.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						2. Datos que recopilamos
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							<strong>Dueños de lista:</strong> nombre, correo electrónico y
							contraseña (gestionados por Clerk), y los datos de la lista que
							ingresas al crearla.
						</li>
						<li>
							<strong>Invitados que apartan regalos:</strong> nombre (requerido)
							y, de forma opcional, correo electrónico, teléfono y un mensaje
							personal. Estos datos se comparten con el dueño de la lista para
							que pueda coordinar la entrega.
						</li>
					</ul>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						3. Procesadores terceros
					</h2>
					<p className="mb-3">
						Para operar el servicio, utilizamos los siguientes proveedores:
					</p>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							<strong>Clerk</strong> — autenticación e identidad de usuarios.
						</li>
						<li>
							<strong>Neon</strong> — base de datos PostgreSQL donde se
							almacenan las listas y los apartados de regalos.
						</li>
						<li>
							<strong>UploadThing</strong> — almacenamiento de imágenes subidas
							por los dueños de listas.
						</li>
						<li>
							<strong>PostHog</strong> — análisis de producto (eventos de uso
							agregados y anonimizados).
						</li>
						<li>
							<strong>Sentry</strong> — monitoreo de errores (capturas de
							excepciones en producción).
						</li>
					</ul>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						4. Cómo usamos los datos
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>Proveer y mejorar el servicio.</li>
						<li>
							Comunicar al dueño de la lista quién apartó un regalo y sus datos
							de contacto.
						</li>
						<li>Detectar y corregir errores técnicos.</li>
					</ul>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						5. Retención y eliminación
					</h2>
					<p>
						Puedes eliminar tu cuenta y tus listas desde el dashboard en
						cualquier momento. Los datos de invitados asociados a listas
						eliminadas se borran junto con ellas.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">6. Contacto</h2>
					<p>
						Para preguntas sobre privacidad, escríbenos a{" "}
						<a
							className="text-[var(--mrose)] underline"
							href={`mailto:${SUPPORT_EMAIL}`}
						>
							{SUPPORT_EMAIL}
						</a>
						.
					</p>
				</div>
			</section>
		</main>
	);
}
