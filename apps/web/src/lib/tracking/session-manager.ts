import { trpc } from "@/lib/trpc"; // Assuming this is the path to tRPC client

const SESSION_ID_KEY = "tracking_session_id";

let currentSessionId: string | null = null;

// Function to get user ID - this is a placeholder
// You'll need to integrate this with your actual auth system (e.g., from context, a hook, etc.)
const getUserId = (): string | undefined => {
  // Example: return useAuth().user?.id;
  // For now, returning undefined to simulate an anonymous user
  return undefined;
};

export const getSessionId = async (): Promise<string | null> => {
  if (currentSessionId) {
    return currentSessionId;
  }

  const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
  if (storedSessionId) {
    // Potentially add a check here to see if this session is still valid on the server
    // For now, we assume if it's in localStorage, it's good to use,
    // and the server-side getSession will handle expiration.
    currentSessionId = storedSessionId;
    return currentSessionId;
  }
  return null;
};

export const ensureSession = async (userId?: string): Promise<string> => {
  let sessionId = await getSessionId();
  const effectiveUserId = userId || getUserId();

  if (sessionId) {
    // Optionally, verify with server if session is still active if not done by getSessionId
    // For this implementation, getSession tRPC call handles renewal or creation if expired
    const serverSession = await trpc.logs.getSession.query({ userId: effectiveUserId });
    if (serverSession && serverSession.id === sessionId) {
      currentSessionId = serverSession.id; // Ensure local state is up-to-date
      localStorage.setItem(SESSION_ID_KEY, currentSessionId);
      return currentSessionId;
    }
    // If local session ID is not matching or invalid, force a new one.
  }

  // If no local session or it's invalid, get/create a new one from the server
  const newSession = await trpc.logs.getSession.query({ userId: effectiveUserId });
  currentSessionId = newSession.id;
  localStorage.setItem(SESSION_ID_KEY, currentSessionId);
  return currentSessionId;
};

export const startNewSession = async (userId?: string): Promise<string> => {
  const effectiveUserId = userId || getUserId();
  const newSession = await trpc.logs.createSession.mutate({ userId: effectiveUserId });
  currentSessionId = newSession.id;
  localStorage.setItem(SESSION_ID_KEY, currentSessionId);
  return currentSessionId;
};

export const endCurrentSession = async (): Promise<void> => {
  const sessionId = await getSessionId();
  if (sessionId) {
    try {
      await trpc.logs.endSession.mutate({ sessionId });
    } catch (error) {
      console.error("Failed to end session on server:", error);
      // Decide if we should still clear locally or not
    }
    localStorage.removeItem(SESSION_ID_KEY);
    currentSessionId = null;
  }
};

// Listener for user login/logout (example)
// You would call these from your auth flow
export const onUserLogin = async (userId: string) => {
  await endCurrentSession(); // End previous anonymous or other user's session
  await startNewSession(userId);
};

export const onUserLogout = async () => {
  await endCurrentSession();
  // Optionally, start a new anonymous session immediately
  // await ensureSession();
};

// Initialize session on load
// ensureSession().then(id => console.log("Initial session ID:", id));

// Note: The nanoid import was `import { मीटिंग } from "nanoid";`
// This is likely a copy-paste or translation error from a previous interaction.
// It should be `import { nanoid } from "nanoid";` if nanoid is directly used here,
// but it seems it's only used server-side. So, removing the import from client-side.
