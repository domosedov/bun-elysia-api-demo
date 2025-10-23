# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Define build arguments for environment variables
ARG NODE_ENV=production
ARG DATABASE_URL
ARG REDIS_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG WEB_APP_URL

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV WEB_APP_URL=${WEB_APP_URL}

# Run type checking instead of build (since there's no build script)
RUN bun run typecheck

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src ./src
COPY --from=prerelease /usr/src/app/drizzle ./drizzle
COPY --from=prerelease /usr/src/app/migrate.ts .
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/tsconfig.json .

# Set environment variables in final image
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV WEB_APP_URL=${WEB_APP_URL}

# Create startup script to run migrations before starting the app
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
bun run migrate.ts\n\
echo "Starting application..."\n\
bun run src/index.ts' > /usr/src/app/start.sh && \
chmod +x /usr/src/app/start.sh

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["/usr/src/app/start.sh"]