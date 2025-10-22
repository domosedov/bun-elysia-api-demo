import { OpenAPIV3 } from 'openapi-types'
import { auth } from '.'

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>

const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
	getPaths: (prefix = '/auth') =>
		getSchema().then(({ paths }) => {
			const reference: typeof paths = Object.create(null)

			for (const path of Object.keys(paths)) {
				const key = prefix + path
				reference[key] = paths[path]!

				for (const method of Object.keys(paths[path]!)) {
					const ref = reference[key]
					const operation = ref[method as keyof typeof ref]

					operation!.tags = ['Authentication']
				}
			}

			return reference
		}) as Promise<OpenAPIV3.PathsObject>,
	components: getSchema().then(
		({ components }) => components,
	) as Promise<OpenAPIV3.ComponentsObject>,
} as const
