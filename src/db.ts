import { drizzle } from "drizzle-orm/bun-sql";

const sqlite = new Bun.SQL("sqlite://myapp.db");
export const db = drizzle(sqlite);
