FROM oven/bun AS build

WORKDIR /app

# Обязательные переменные окружения для сборки
ARG DATABASE_URL
ARG REDIS_URL
ARG BETTER_AUTH_SECRET

# Устанавливаем Python и build tools для компиляции нативных модулей
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Cache packages installation
COPY package.json package.json
COPY bun.lock bun.lock
COPY tsconfig.json tsconfig.json

RUN bun install

COPY ./src ./src

ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	src/index.ts

FROM oven/bun AS runtime

WORKDIR /app

# Обязательные переменные окружения для runtime
ARG DATABASE_URL
ARG REDIS_URL
ARG BETTER_AUTH_SECRET

# Копируем скомпилированный сервер
COPY --from=build /app/server server

# Копируем файлы миграций справочника
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/migrate.ts ./migrate.ts

ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}
ENV REDIS_URL=${REDIS_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

# Создаем скрипт запуска с миграциями
RUN echo '#!/bin/sh\n\
echo "🔄 Выполняем миграции базы данных..."\n\
bun run migrate.ts\n\
echo "✅ Миграции выполнены"\n\
echo "🚀 Запускаем сервер..."\n\
./server' > start.sh && chmod +x start.sh

CMD ["./start.sh"]

EXPOSE 3000