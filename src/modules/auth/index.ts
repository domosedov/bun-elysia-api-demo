import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt, openAPI } from 'better-auth/plugins'
import { db } from '~/db'
import * as authSchema from '~/db/schema/auth'

export const auth = betterAuth({
	basePath: '/',
	trustedOrigins: [process.env['WEB_APP_URL']!],
	database: drizzleAdapter(db, {
		provider: 'pg',
		usePlural: true,
		debugLogs: false,
		schema: authSchema,
	}),
	plugins: [openAPI(), jwt()],
	emailAndPassword: {
		enabled: true,
	},
})
