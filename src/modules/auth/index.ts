import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI } from 'better-auth/plugins'
import { db } from '~/db'
import * as authSchema from '~/db/schema/auth'

export const auth = betterAuth({
	basePath: '/',
	database: drizzleAdapter(db, {
		provider: 'pg',
		usePlural: true,
		debugLogs: false,
		schema: authSchema,
	}),
	plugins: [openAPI()],
	emailAndPassword: {
		enabled: true,
	},
})
