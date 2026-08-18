// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useClerkMock = vi.hoisted(() => vi.fn());
const useSignInMock = vi.hoisted(() => vi.fn());
const useSignUpMock = vi.hoisted(() => vi.fn());
const routerPushMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
	useClerk: useClerkMock,
	useSignIn: useSignInMock,
	useSignUp: useSignUpMock,
}));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: routerPushMock }),
	useSearchParams: () => new URLSearchParams("redirect_url=/dashboard"),
}));

import SSOCallbackPage from "./page";

describe("SSOCallbackPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useClerkMock.mockReturnValue({ loaded: true, setActive: vi.fn() });
		useSignUpMock.mockReturnValue({ signUp: null });
	});

	it("finalizes a completed OAuth sign-in instead of losing Clerk state", async () => {
		const finalize = vi.fn().mockResolvedValue(undefined);
		useSignInMock.mockReturnValue({
			signIn: { status: "complete", finalize },
		});

		render(<SSOCallbackPage />);

		await waitFor(() => expect(finalize).toHaveBeenCalledTimes(1));
		expect(finalize).toHaveBeenCalledWith({ navigate: expect.any(Function) });
		expect(routerPushMock).not.toHaveBeenCalled();
	});
});
