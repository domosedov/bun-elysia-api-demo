import openapi, { fromTypes } from '@elysiajs/openapi'
import { Elysia } from 'elysia'
import * as z from 'zod'
import { OpenAPI } from '~/modules/auth/openapi'
import { authService } from '~/modules/auth/service'
import { todosRoutes } from '~/modules/todos'

const authOpenApiComponents = await OpenAPI.components
const authOpenApiPaths = await OpenAPI.getPaths()

const app = new Elysia()
	.use(
		openapi({
			documentation: {
				components: authOpenApiComponents,
				paths: authOpenApiPaths,
			},
			mapJsonSchema: {
				zod: (io: Parameters<typeof z.toJSONSchema>[0]) => {
					return z.toJSONSchema(io, {
						unrepresentable: 'any',
						override: (ctx) => {
							const def = ctx.zodSchema._zod.def
							if (def.type === 'date') {
								ctx.jsonSchema.type = 'string'
								ctx.jsonSchema.format = 'date-time'
							}
						},
					})
				},
			},
			references: fromTypes(
				process.env.NODE_ENV === 'production'
					? 'dist/index.d.ts'
					: 'src/index.ts',
				{
					debug: true,
				},
			),
		}),
	)
	.use(authService)
	.use(todosRoutes)
	.get('/', () => ({ message: 'Hello Elysia' }), {
		response: z.object({
			message: z.string(),
		}),
		tags: ['Home'],
	})
	.listen(3000)

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
)
