import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

const sqlite = new SQL(process.env["DB_FILE_NAME"]!);
export const db = drizzle(sqlite);
