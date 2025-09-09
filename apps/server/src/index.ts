import "dotenv/config";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import { env } from "./lib/env";
import { appRouter } from "./routers/index";
import { aiTools } from "./tools";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_API_KEY || undefined,
});

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => {
			return createContext({ context });
		},
	}),
);

app.post("/api/chat", async (c) => {
	try {
		const { messages } = await c.req.json<{ messages: UIMessage[] }>();

		if (!Array.isArray(messages)) {
			return c.json({ error: "Invalid body" }, 400);
		}

		const result = streamText({
			model: google("gemini-2.5-flash"),
			messages: convertToModelMessages(messages),
			tools: aiTools,
			// Enable streaming of tool call deltas/parts for UI rendering.
			// @ts-expect-error: Some SDK versions don't type this yet, but it works at runtime
			toolCallStreaming: true,
		});

		return result.toUIMessageStreamResponse();
	} catch (e) {
		return c.json(
			{ error: e instanceof Error ? e.message : "Unknown error" },
			500,
		);
	}
});

app.get("/", (c) => {
	return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
