import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { LOG_SESSION_KEY } from "./index";

export default function LogSessionInitializer() {
  const { data: session } = authClient.useSession();
  const createSession = trpc.logs.createSession.useMutation();

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(LOG_SESSION_KEY);
      return;
    }
    const existing = localStorage.getItem(LOG_SESSION_KEY);
    if (!existing && !createSession.isPending) {
      createSession.mutate(undefined, {
        onSuccess: (data) => {
          localStorage.setItem(LOG_SESSION_KEY, data.id);
        },
      });
    }
  }, [session]);

  return null;
}
