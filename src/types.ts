export interface Todo {
  id: string
  text: string
  completed: boolean
  /** Unix timestamp in milliseconds. Kept in the data model, not shown in the UI. */
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'

export interface EmptyMessage {
  title: string
  hint: string
}
