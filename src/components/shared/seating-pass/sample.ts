import type { SeatingPassViewModel } from "@/server/mappers/view-models";

/** Sample party for the settings preview and tests; never real guest data. */
export const SAMPLE_SEATING_PASS: SeatingPassViewModel = {
	primaryName: "Lady Díaz",
	daysAway: 3,
	countdownLabel: "Faltan 3 días",
	eventDate: "2027-06-26T00:00:00.000Z",
	eventTime: "18:00",
	location: "Casa Daniela, Av. José Larco 812, Miraflores",
	members: [
		{ id: "sample-lady", name: "Lady Díaz", label: "Mesa 4", tableId: "t4" },
		{ id: "sample-marco", name: "Marco", label: "Mesa 4", tableId: "t4" },
		{
			id: "sample-sofia",
			name: "Sofía",
			label: "Mesa 7 · niños",
			tableId: "t7",
		},
	],
	tables: [
		{
			id: "t4",
			label: "Mesa 4",
			numeral: "4",
			capacity: 8,
			memberNames: ["Lady Díaz", "Marco"],
			mates: ["Ana R.", "Pedro R."],
		},
		{
			id: "t7",
			label: "Mesa 7 · niños",
			numeral: "Mesa 7 · niños",
			capacity: 6,
			memberNames: ["Sofía"],
			mates: ["Luz M."],
		},
	],
	headline: { label: "Mesa 4", numeral: "4" },
};
