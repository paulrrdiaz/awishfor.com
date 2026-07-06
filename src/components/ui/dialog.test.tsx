// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

function renderDialog() {
	return render(
		<Dialog>
			<DialogTrigger>Open</DialogTrigger>
			<DialogContent>
				<DialogTitle>Title</DialogTitle>
				<DialogDescription>Description</DialogDescription>
			</DialogContent>
		</Dialog>,
	);
}

describe("Dialog", () => {
	it("opens on trigger click and shows content", async () => {
		const user = userEvent.setup();
		renderDialog();

		expect(screen.queryByText("Title")).not.toBeInTheDocument();

		await user.click(screen.getByText("Open"));

		await waitFor(() => {
			expect(screen.getByText("Title")).toBeInTheDocument();
		});
	});

	it("closes on Escape key", async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.click(screen.getByText("Open"));
		await waitFor(() => {
			expect(screen.getByText("Title")).toBeInTheDocument();
		});

		await user.keyboard("{Escape}");

		await waitFor(() => {
			expect(screen.queryByText("Title")).not.toBeInTheDocument();
		});
	});

	it("closes on close button click", async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.click(screen.getByText("Open"));
		await waitFor(() => {
			expect(screen.getByText("Title")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: /cerrar/i }));

		await waitFor(() => {
			expect(screen.queryByText("Title")).not.toBeInTheDocument();
		});
	});
});
