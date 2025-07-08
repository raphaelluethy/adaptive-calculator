import { useEffect, useRef } from "react";
import { trpc } from "@/utils/trpc";
import { LOG_SESSION_KEY } from "./index";

export default function MousePositionLogger({
  updateRate = 500,
}: {
  updateRate?: number;
}) {
  const logMutation = trpc.logs.createLog.useMutation();
  const lastSent = useRef(0);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    sessionId.current = localStorage.getItem(LOG_SESSION_KEY);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSent.current < updateRate) {
        return;
      }
      lastSent.current = now;
      if (!sessionId.current) return;
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
          onSuccess: ({ sessionId: newId }) => {
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
  }, [updateRate]);

  return null;
}
