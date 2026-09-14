/**
 * Spanish copy for the Mesas surface, taken verbatim from
 * `Claude Design Output - Mesas.md` §11.
 *
 * Two keys are adapted rather than copied, because the design output describes
 * behaviour this change deliberately defers (see `proposal.md` → Scope
 * decisions): `delete.toast` drops its "Deshacer" affordance (there is no undo
 * in v1), and `mobile.notice` says the canvas is not offered at all below
 * 768px rather than being read-only for moving tables.
 */
export const SEATING_COPY = {
	viewSubtitle:
		"Arrastra a cada invitado hasta su mesa. Mueve las mesas para que el plano se parezca al salón real.",
	emptyNoGuestsTitle: "Primero necesitas invitados",
	emptyNoGuestsBody:
		"Las mesas se llenan con las personas de tus invitaciones. Agrega invitados en la pestaña Invitados y vuelve aquí para armar el plano de tu salón.",
	emptyNoTablesTitle: "Tu salón está vacío",
	emptyNoTablesBody:
		"Agrega tu primera mesa, elige si es redonda o rectangular y cuántas personas se sientan. Después la arrastras donde va en el salón.",
	panelUnassigned: "Sin mesa asignada",
	panelSeatTogether: "Sentar juntos",
	chipUnnamed: "Acompañante",
	chipPutName: "Poner nombre",
	tableFull: "Mesa completa",
	allSeatedTitle: "Ya están todos sentados",
	printTitle: "Encuentra tu mesa",
	printAnyway: "Imprimir así de todas formas",
	printGoAssign: "Ir a asignarlos",
	mobileNotice:
		"El plano no se puede editar en un teléfono. Para arrastrar mesas e invitados abre Mesas en una tablet o computadora.",
	saveFailed: "No se pudo guardar. Intenta de nuevo",
} as const;

export const chipParty = (party: string) => `con ${party}`;

export const dropInvalid = (table: string, capacity: number) =>
	`${table} está completa (${capacity}/${capacity}). Cambia su capacidad o elige otra mesa.`;

export const capacityBlockedTitle = (next: number, seated: number) =>
	`No se puede bajar a ${next}: hay ${seated} personas sentadas`;

export const capacityBlockedBody = (mustMove: number) =>
	`Mueve primero a ${mustMove} ${mustMove === 1 ? "persona" : "personas"} a otra mesa. Nadie se levanta solo — tú decides quién.`;

export const deleteTitle = (table: string) => `¿Eliminar ${table}?`;

export const deleteBody = (seated: number) =>
	`Las ${seated} personas sentadas aquí volverán a «Sin mesa asignada». No se borra ningún invitado ni su confirmación — solo esta mesa.`;

export const deleteToast = (table: string, seated: number) =>
	seated > 0
		? `${table} eliminada · ${seated} ${seated === 1 ? "persona volvió" : "personas volvieron"} a «Sin mesa asignada»`
		: `${table} eliminada`;

export const allSeatedBody = (people: number) =>
	`Las ${people} personas tienen mesa. Imprime la hoja para el ingreso — si alguien cambia su respuesta, vuelve a aparecer acá.`;

export const printWarning = (unseated: number) =>
	`${unseated} ${unseated === 1 ? "persona todavía no tiene" : "personas todavía no tienen"} mesa`;

export const declinedNote = (declined: number) =>
	`${declined} ${declined === 1 ? "invitado marcado" : "invitados marcados"} «No asistirá» no ${declined === 1 ? "aparece" : "aparecen"} aquí.`;

export const headerCount = (tables: number, capacity: number, seated: number) =>
	`${tables} ${tables === 1 ? "mesa" : "mesas"} · ${capacity} ${capacity === 1 ? "asiento" : "asientos"} · ${seated} ${seated === 1 ? "sentado" : "sentados"}`;

export const capacityShortfall = (shortfall: number) =>
	`Tienes ${shortfall} ${shortfall === 1 ? "persona más que asientos" : "personas más que asientos"}. Agrega una mesa o aumenta capacidades.`;

/** The party-derived placeholder an unnamed companion prints and reads under. */
export const unnamedLabel = (partyLabel: string) =>
	`Acompañante de ${partyLabel}`;
