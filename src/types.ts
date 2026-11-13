export interface Todo {
  id: string
  text: string
  completed: boolean
  /** Unix timestamp in milliseconds. */
  createdAt: number
}

export type TodoFilter = 'all' | 'active' | 'completed'
