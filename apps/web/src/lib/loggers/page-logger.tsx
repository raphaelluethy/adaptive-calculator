import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { LOG_SESSION_KEY } from "./index";

export default function PageLogger() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const prev = useRef(pathname);
  const sessionId = useRef<string | null>(null);
  const logMutation = trpc.logs.createLog.useMutation();

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
        onSuccess: ({ sessionId: newId }) => {
          if (newId !== sessionId.current) {
            sessionId.current = newId;
            localStorage.setItem(LOG_SESSION_KEY, newId);
          }
        },
      },
    );
    prev.current = pathname;
  }, [pathname]);

  return null;
}
