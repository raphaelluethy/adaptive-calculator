import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { LOG_SESSION_KEY } from "./index";

export default function ClickLogger() {
	const logMutation = useMutation(trpc.logs.createLog.mutationOptions());
	const sessionId = useRef<string | null>(null);

	useEffect(() => {
		sessionId.current = localStorage.getItem(LOG_SESSION_KEY);
	}, []);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (!sessionId.current) return;
			logMutation.mutate(
				{
					sessionId: sessionId.current,
					type: "clicked",
					data: {
						page: window.location.pathname,
						x: e.clientX / window.innerWidth,
						y: e.clientY / window.innerHeight,
					},
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
		};
		window.addEventListener("click", handler);
		return () => window.removeEventListener("click", handler);
	}, [logMutation.mutate]);

	return null;
}
