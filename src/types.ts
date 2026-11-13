export type TodoCategory = 'urgent' | 'normal'

/** Display order matters: urgent tasks are shown first. */
export const CATEGORIES: { value: TodoCategory; label: string }[] = [
  { value: 'urgent', label: 'Срочно' },
  { value: 'normal', label: 'Не срочно' },
]

export const DEFAULT_CATEGORY: TodoCategory = 'normal'

export interface Todo {
  id: string
  text: string
  completed: boolean
  category: TodoCategory
  /** Unix timestamp in milliseconds. Kept in the data model, not shown in the UI. */
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export interface EmptyMessage {
  title: string
  hint: string
}
