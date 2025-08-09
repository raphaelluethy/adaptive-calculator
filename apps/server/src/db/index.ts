import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../lib/env";

const client = createClient({
	url: env.DATABASE_URL ?? "",
});

export const db = drizzle({ client });
