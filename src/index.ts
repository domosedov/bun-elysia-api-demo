import { cors } from "@elysiajs/cors";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import * as z from "zod";
import { OpenAPI } from "~/modules/auth/openapi";
import { authModule } from "~/modules/auth/service";
import { todosModule } from "~/modules/todos";

const authOpenApiComponents = await OpenAPI.components;
const authOpenApiPaths = await OpenAPI.getPaths();

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      documentation: {
        components: authOpenApiComponents,
        paths: authOpenApiPaths,
      },
      mapJsonSchema: {
        zod: (io: Parameters<typeof z.toJSONSchema>[0]) => {
          return z.toJSONSchema(io, {
            unrepresentable: "any",
            override: (ctx) => {
              const def = ctx.zodSchema._zod.def;
              if (def.type === "date") {
                ctx.jsonSchema.type = "string";
                ctx.jsonSchema.format = "date-time";
              }
            },
          });
        },
      },
      references: fromTypes("src/index.ts", {
        debug: true,
      }),
    })
  )
  .use(authModule)
  .use(todosModule)
  .get("/", () => ({ message: "Hello Elysia" }), {
    response: z.object({
      message: z.string(),
    }),
    tags: ["Home"],
  })
  .get("/ping", () => "pong", {
    response: z.string(),
  })
  .get(
    "/health",
    () => ({ status: "ok", timestamp: new Date().toISOString() }),
    {
      response: z.object({
        status: z.string(),
        timestamp: z.string(),
      }),
      tags: ["Health"],
    }
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
