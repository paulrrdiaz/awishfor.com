// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";

function renderAlertDialog() {
	return render(
		<AlertDialog>
			<AlertDialogTrigger>Open</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogTitle>Are you sure?</AlertDialogTitle>
				<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
				<AlertDialogAction>Confirm</AlertDialogAction>
			</AlertDialogContent>
		</AlertDialog>,
	);
}

describe("AlertDialog", () => {
	it("opens on trigger click and shows content", async () => {
		const user = userEvent.setup();
		renderAlertDialog();

		expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();

		await user.click(screen.getByText("Open"));

		await waitFor(() => {
			expect(screen.getByText("Are you sure?")).toBeInTheDocument();
		});
	});

	it("closes on cancel click", async () => {
		const user = userEvent.setup();
		renderAlertDialog();

		await user.click(screen.getByText("Open"));
		await waitFor(() => {
			expect(screen.getByText("Are you sure?")).toBeInTheDocument();
		});

		await user.click(screen.getByText("Cancel"));

		await waitFor(() => {
			expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
		});
	});

	it("closes on Escape key", async () => {
		const user = userEvent.setup();
		renderAlertDialog();

		await user.click(screen.getByText("Open"));
		await waitFor(() => {
			expect(screen.getByText("Are you sure?")).toBeInTheDocument();
		});

		await user.keyboard("{Escape}");

		await waitFor(() => {
			expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
		});
	});
});
