import openapi, { fromTypes } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import * as z from "zod";
import { auth } from "./auth";
import { OpenAPI } from "./auth/openapi";

const betterAuth = new Elysia({ name: "better-auth" })
  .mount("/auth", auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const authOpenApiComponents = await OpenAPI.components;
const authOpenApiPaths = await OpenAPI.getPaths();

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        components: authOpenApiComponents,
        paths: authOpenApiPaths,
      },
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      references: fromTypes(
        process.env.NODE_ENV === "production"
          ? "dist/index.d.ts"
          : "src/index.ts",
        {
          debug: true,
        }
      ),
    })
  )
  .use(betterAuth)
  .get("/", () => ({ message: "Hello Elysia" }), {
    response: z.object({
      message: z.string(),
    }),
    tags: ["Home"],
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
