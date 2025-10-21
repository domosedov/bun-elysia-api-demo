import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "../db";

export const auth = betterAuth({
  basePath: "/",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    usePlural: true,
    debugLogs: true,
  }),
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true,
  },
});
