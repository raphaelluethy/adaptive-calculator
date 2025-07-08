import React, { useEffect, useRef, useState } from "react";
import { throttle } from "lodash-es";
import { trpc } from "@/lib/trpc";
import { ensureSession } from "./session-manager";

interface MousePositionLoggerProps {
  updateRate?: number; // in milliseconds
  enabled?: boolean;
}

const MousePositionLogger: React.FC<MousePositionLoggerProps> = ({
  updateRate = 500,
  enabled = true,
}) => {
  const createLogMutation = trpc.logs.createLog.useMutation();
  const lastReportedPosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseMove = throttle(async (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      const normalizedX = parseFloat(x.toFixed(4)); // Keep precision reasonable
      const normalizedY = parseFloat(y.toFixed(4));

      // Optional: Only report if position changed significantly
      // if (lastReportedPosition.current &&
      //     Math.abs(lastReportedPosition.current.x - normalizedX) < 0.001 &&
      //     Math.abs(lastReportedPosition.current.y - normalizedY) < 0.001) {
      //   return;
      // }

      const sessionId = await ensureSession();
      if (!sessionId) {
        console.error("MousePositionLogger: No session ID available.");
        return;
      }

      try {
        await createLogMutation.mutateAsync({
          sessionId,
          type: "mouse-position",
          data: { x: normalizedX, y: normalizedY },
        });
        lastReportedPosition.current = { x: normalizedX, y: normalizedY };
      } catch (error) {
        console.error("Failed to log mouse position:", error);
      }
    }, updateRate);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      handleMouseMove.cancel(); // Cancel any scheduled execution
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateRate, enabled, createLogMutation]);

  return null; // This component does not render anything
};

export default MousePositionLogger;
