# Настройка Docker с PostgreSQL для локальной разработки

## Быстрый старт

### 1. Установка зависимостей

```bash
bun install
```

### 2. Переменные окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_demo
```

### 3. Запуск PostgreSQL и pgAdmin в Docker

```bash
# Запуск PostgreSQL и pgAdmin
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

### 4. Запуск приложения локально

```bash
# В отдельном терминале
bun run dev
```

### 5. Миграции базы данных

```bash
# Генерация миграций
bun run db:generate

# Применение миграций
bun run db:migrate
```

### 6. Настройка pgAdmin

1. Откройте http://localhost:8080
2. Войдите с данными: `admin@admin.com` / `admin`
3. Добавьте новый сервер:
   - **Name**: `API Demo DB`
   - **Host**: `postgres` (имя сервиса в Docker)
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `postgres`
   - **Database**: `api_demo`

## Доступ к сервисам

- **Приложение**: http://localhost:3000 (запускается локально)
- **pgAdmin**: http://localhost:8080
  - Email: `admin@admin.com`
  - Пароль: `admin`
- **PostgreSQL**: localhost:5432 (в Docker контейнере)
  - База данных: `api_demo`
  - Пользователь: `postgres`
  - Пароль: `postgres`

## Команды для разработки

```bash
# Локальная разработка
bun run dev

# Перезапуск PostgreSQL
docker-compose restart postgres

# Подключение к PostgreSQL через psql
docker-compose exec postgres psql -U postgres -d api_demo

# Очистка volumes (удаление данных PostgreSQL)
docker-compose down -v

# Просмотр всех контейнеров
docker-compose ps -a
```

## Структура для разработки

- **PostgreSQL**: Запускается в Docker контейнере
- **Приложение**: Запускается локально через `bun run dev`
- **Горячая перезагрузка**: Работает автоматически при изменениях кода
- **База данных**: Персистентная, данные сохраняются в Docker volume
