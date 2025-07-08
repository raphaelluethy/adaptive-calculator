import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { LOG_SESSION_KEY } from "./index";

export default function PageLogger() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const prev = useRef(pathname);
	const sessionId = useRef<string | null>(null);
	const logMutation = useMutation(trpc.logs.createLog.mutationOptions());

	useEffect(() => {
		sessionId.current = localStorage.getItem(LOG_SESSION_KEY);
	}, []);

	useEffect(() => {
		if (prev.current === pathname || !sessionId.current) {
			prev.current = pathname;
			return;
		}
		logMutation.mutate(
			{
				sessionId: sessionId.current,
				type: "new-page",
				data: { from: prev.current, to: pathname },
			},
			{
				onSuccess: (data) => {
					const { sessionId: newId } = data as { sessionId: string };
					if (newId !== sessionId.current) {
						sessionId.current = newId;
						localStorage.setItem(LOG_SESSION_KEY, newId);
					}
				},
			},
		);
		prev.current = pathname;
	}, [pathname, logMutation.mutate]);

	return null;
}
