import { and, eq } from 'drizzle-orm'
import { Elysia, status } from 'elysia'
import * as z from 'zod'
import { db } from '~/db'
import { todos } from '~/db/schema/todos'
import { authService } from '~/modules/auth/service'
import {
  createTodoSchema,
  todoResponseSchema,
  todosListResponseSchema,
  updateTodoSchema,
} from './schema'

export const todosRoutes = new Elysia({ prefix: '/todos' })
  .use(authService)
  // Получить все todos пользователя
  .get(
    '',
    async ({ user }) => {
      const userTodos = await db
        .select()
        .from(todos)
        .where(eq(todos.userId, user.id))
        .orderBy(todos.createdAt)

      return userTodos
    },
    {
      auth: true,
      response: todosListResponseSchema,
      tags: ['Todos'],
      summary: 'Получить все todos пользователя',
    },
  )
  // Получить конкретный todo
  .get(
    '/:id',
    async ({ params, user, status }) => {
      const todo = await db
        .select()
        .from(todos)
        .where(and(eq(todos.id, params.id), eq(todos.userId, user.id)))
        .limit(1)

      if (!todo.length) {
        return status(404, { message: 'Todo не найден' })
      }

      return todo[0]!
    },
    {
      auth: true,
      response: {
        200: todoResponseSchema,
        404: z.object({ message: z.string() }),
      },
      tags: ['Todos'],
      summary: 'Получить конкретный todo',
    },
  )
  // Создать новый todo
  .post(
    '',
    async ({ body, user }) => {
      const newTodo = await db
        .insert(todos)
        .values({
          id: crypto.randomUUID(),
          title: body.title,
          description: body.description || null,
          userId: user.id,
        })
        .returning()

      return newTodo[0]!
    },
    {
      auth: true,
      body: createTodoSchema,
      response: todoResponseSchema,
      tags: ['Todos'],
      summary: 'Создать новый todo',
    },
  )
  // Обновить todo
  .patch(
    '/:id',
    async ({ params, body, user, status }) => {
      const updatedTodo = await db
        .update(todos)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(and(eq(todos.id, params.id), eq(todos.userId, user.id)))
        .returning()

      if (!updatedTodo.length) {
        return status(404, { message: 'Todo не найден' })
      }

      return updatedTodo[0]!
    },
    {
      auth: true,
      body: updateTodoSchema,
      response: {
        200: todoResponseSchema,
        404: z.object({ message: z.string() }),
      },
      tags: ['Todos'],
      summary: 'Обновить todo',
    },
  )
  // Удалить todo
  .delete(
    '/:id',
    async ({ params, user }) => {
      const deletedTodo = await db
        .delete(todos)
        .where(and(eq(todos.id, params.id), eq(todos.userId, user.id)))
        .returning()

      if (!deletedTodo.length) {
        return status(404, { message: 'Todo не найден' })
      }

      return deletedTodo[0]!
    },
    {
      auth: true,
      response: {
        200: todoResponseSchema,
        404: z.object({ message: z.string() }),
      },
      tags: ['Todos'],
      summary: 'Удалить todo',
    },
  )
