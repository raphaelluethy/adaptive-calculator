import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { LOG_SESSION_KEY } from "./index";

export default function LogSessionInitializer() {
	const { data: session } = authClient.useSession();
	const createSession = useMutation(
		trpc.logs.createSession.mutationOptions({
			onSuccess: (data: { id: string }) => {
				localStorage.setItem(LOG_SESSION_KEY, data.id);
			},
		}),
	);

	useEffect(() => {
		if (!session) {
			localStorage.removeItem(LOG_SESSION_KEY);
			return;
		}
		const existing = localStorage.getItem(LOG_SESSION_KEY);
		if (!existing && !createSession.isPending) {
			createSession.mutate();
		}
	}, [session, createSession.isPending, createSession.mutate]);

	return null;
}
