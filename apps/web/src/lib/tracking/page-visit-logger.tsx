import React, { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router"; // Assuming this hook is available
import { trpc } from "@/lib/trpc";
import { ensureSession } from "./session-manager";

interface PageVisitLoggerProps {
  enabled?: boolean;
}

const PageVisitLogger: React.FC<PageVisitLoggerProps> = ({ enabled = true }) => {
  const createLogMutation = trpc.logs.createLog.useMutation();
  const routerState = useRouterState(); // Hook to get current router state
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentPath = routerState.location.pathname + routerState.location.search + routerState.location.hash;

    const logPageVisit = async () => {
      if (previousPath.current !== null && previousPath.current !== currentPath) {
        const sessionId = await ensureSession();
        if (!sessionId) {
          console.error("PageVisitLogger: No session ID available.");
          return;
        }
        try {
          await createLogMutation.mutateAsync({
            sessionId,
            type: "new-page",
            data: {
              oldUrl: previousPath.current,
              newUrl: currentPath,
            },
          });
        } catch (error) {
          console.error("Failed to log page visit:", error);
        }
      }
      previousPath.current = currentPath;
    };

    logPageVisit(); // Log initial visit and subsequent navigations

  }, [routerState.location.pathname, routerState.location.search, routerState.location.hash, enabled, createLogMutation]);

  return null; // This component does not render anything
};

export default PageVisitLogger;
