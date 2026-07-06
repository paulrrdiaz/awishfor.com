// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

describe("Select", () => {
	it("opens the list on trigger click and selecting an item updates the value", async () => {
		const user = userEvent.setup();
		render(
			<Select defaultValue="apple">
				<SelectTrigger>
					<SelectValue placeholder="Pick a fruit" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
				</SelectContent>
			</Select>,
		);

		expect(screen.getByRole("combobox")).toHaveTextContent("Apple");

		await user.click(screen.getByRole("combobox"));

		const bananaOption = await screen.findByRole("option", { name: "Banana" });
		await user.click(bananaOption);

		await waitFor(() => {
			expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
		});
	});

	it("renders a controlled value", async () => {
		function Controlled() {
			const [value, setValue] = useState("banana");
			return (
				<Select
					onValueChange={(next) => setValue(next ?? "banana")}
					value={value}
				>
					<SelectTrigger>
						<SelectValue placeholder="Pick a fruit" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="apple">Apple</SelectItem>
						<SelectItem value="banana">Banana</SelectItem>
					</SelectContent>
				</Select>
			);
		}

		render(<Controlled />);

		expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
	});
});
