import type { Metadata } from "next";
import { SUPPORT_EMAIL } from "@/config/contact";

export const metadata: Metadata = {
	title: "Términos de uso · A Wish For",
	description: "Términos de uso de A Wish For.",
};

export default function TermsPage() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-16 text-[var(--mink)]">
			<h1 className="m-serif mb-2 font-semibold text-[36px]">
				Términos de uso
			</h1>
			<p className="mb-10 text-[var(--mmut)] text-sm">
				Última actualización: junio de 2025
			</p>

			<section className="space-y-8 text-[15px] leading-[1.75]">
				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						1. Aceptación de los términos
					</h2>
					<p>
						Al usar A Wish For (<strong>awishfor.com</strong>), aceptas estos
						términos. Si no los aceptas, por favor no uses el servicio.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">2. El servicio</h2>
					<p>
						A Wish For te permite crear listas de deseos y compartirlas con
						invitados para que puedan apartar regalos. El servicio es gratuito y
						sin comisiones. No procesamos pagos: cualquier transacción ocurre
						directamente entre el dueño de la lista y sus invitados.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						3. Responsabilidad del usuario
					</h2>
					<ul className="list-disc space-y-2 pl-5">
						<li>
							Eres responsable de los datos que publicas en tus listas,
							incluyendo imágenes, nombres de regalos y mensajes.
						</li>
						<li>
							No está permitido usar el servicio para actividades ilegales,
							fraudulentas o que violen derechos de terceros.
						</li>
						<li>
							Mantendrás la confidencialidad de tu contraseña y serás
							responsable de toda la actividad en tu cuenta.
						</li>
					</ul>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						4. Contenido de los usuarios
					</h2>
					<p>
						Conservas la propiedad intelectual sobre el contenido que subes. Nos
						otorgas una licencia no exclusiva, libre de regalías, para mostrar
						ese contenido a los visitantes de tu lista pública.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						5. Disponibilidad del servicio
					</h2>
					<p>
						Nos esforzamos por mantener el servicio disponible, pero no
						garantizamos disponibilidad ininterrumpida. Podemos modificar o
						interrumpir funciones con aviso previo cuando sea posible.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">
						6. Limitación de responsabilidad
					</h2>
					<p>
						A Wish For se provee "tal como está". No somos responsables por
						daños indirectos derivados del uso del servicio, incluyendo
						discrepancias entre regalos aparatados y entregas reales, que son
						responsabilidad del comprador y del dueño de la lista.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">7. Cambios</h2>
					<p>
						Podemos actualizar estos términos. Te notificaremos por correo si
						los cambios son materiales. El uso continuado del servicio implica
						la aceptación de los nuevos términos.
					</p>
				</div>

				<div>
					<h2 className="mb-3 font-semibold text-[18px]">8. Contacto</h2>
					<p>
						Para dudas sobre estos términos, escríbenos a{" "}
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
