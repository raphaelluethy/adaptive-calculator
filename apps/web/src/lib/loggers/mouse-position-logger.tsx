import { trpc } from "@/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { useEffect, useRef } from "react";
import { LOG_SESSION_KEY } from "./index";

export default function MousePositionLogger({
	updateRate = 100,
}: {
	updateRate?: number;
}) {
	const logMutation = useMutation(trpc.logs.createLog.mutationOptions());
	const lastSent = useRef(0);
	const sessionId = useRef<string | null>(null);

	useEffect(() => {
		sessionId.current = localStorage.getItem(LOG_SESSION_KEY);
		if (!sessionId.current) {
			sessionId.current = nanoid();
			localStorage.setItem(LOG_SESSION_KEY, sessionId.current);
		}
	}, []);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (window.location.pathname === "/analytics") return;
			const now = Date.now();
			if (now - lastSent.current < updateRate) {
				return;
			}
			lastSent.current = now;
			if (!sessionId.current) {
				console.log("Session ID not found");
				return;
			}
			logMutation.mutate(
				{
					sessionId: sessionId.current,
					type: "mouse-position",
					data: {
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
		window.addEventListener("mousemove", handler);
		return () => window.removeEventListener("mousemove", handler);
	}, [updateRate, logMutation.mutate]);

	return null;
}
