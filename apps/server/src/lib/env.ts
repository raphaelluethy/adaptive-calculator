import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3000),
	CORS_ORIGIN: z.string().default(""),
	DATABASE_URL: z.string().default(""),
	BETTER_AUTH_SECRET: z.string().default(""),
	BETTER_AUTH_URL: z.string().default(""),
	GOOGLE_API_KEY: z.string().default(""),
	TMUX_PERSIST: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export const env: Env = envSchema.parse(process.env);
