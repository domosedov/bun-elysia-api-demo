import { migrate } from "drizzle-orm/bun-sql/migrator";

import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

const client = new SQL(process.env.DATABASE_URL!);
const db = drizzle({ client });
migrate(db, { migrationsFolder: "./drizzle" });
