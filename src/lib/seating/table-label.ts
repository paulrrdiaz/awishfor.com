export const tableLabel = (table: {
	name: string | null;
	sortOrder: number;
}) => (table.name?.trim() ? table.name.trim() : `Mesa ${table.sortOrder + 1}`);
