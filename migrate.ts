import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";

const client = new SQL(process.env.DATABASE_URL!);

const db = drizzle({ client });

await migrate(db, { migrationsFolder: "./drizzle" })
  .then(() => {
    console.log("Migration completed");
  })
  .catch((error) => {
    console.error("Migration failed", error);
  });
