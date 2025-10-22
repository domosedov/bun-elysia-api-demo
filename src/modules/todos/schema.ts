import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { todos } from '~/db/schema/todos'

// Автоматически генерируемые схемы из Drizzle
export const insertTodoSchema = createInsertSchema(todos)
export const selectTodoSchema = createSelectSchema(todos)

// Схема для создания todo (только необходимые поля)
export const createTodoSchema = insertTodoSchema
  .pick({
    title: true,
    description: true,
  })
  .extend({
    title: z
      .string()
      .min(1, 'Заголовок обязателен')
      .max(255, 'Заголовок слишком длинный'),
  })

// Схема для обновления todo (все поля опциональны кроме id)
export const updateTodoSchema = insertTodoSchema
  .partial()
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    title: z
      .string()
      .min(1, 'Заголовок обязателен')
      .max(255, 'Заголовок слишком длинный')
      .optional(),
  })

// Схема для ответа с todo (полная схема из базы)
export const todoResponseSchema = selectTodoSchema

// Схема для списка todos
export const todosListResponseSchema = z.array(todoResponseSchema)

// Типы для TypeScript
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
export type TodoResponse = z.infer<typeof todoResponseSchema>
export type TodosListResponse = z.infer<typeof todosListResponseSchema>
