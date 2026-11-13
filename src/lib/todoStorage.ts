import type { Todo } from '../types'

/** Versioned key: if the data shape ever changes, a new key avoids reading stale data. */
export const STORAGE_KEY = 'todo-list:v1'

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === 'string' &&
    candidate.id !== '' &&
    typeof candidate.text === 'string' &&
    candidate.text.trim() !== '' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  )
}

/**
 * Reads todos from localStorage.
 * Missing, unparsable or malformed data results in an empty list instead of an error.
 */
export function loadTodos(): Todo[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isTodo)) {
      return parsed
    }

    console.warn(`Ignoring malformed data in localStorage["${STORAGE_KEY}"]`)
    return []
  } catch (error) {
    console.warn(`Could not read localStorage["${STORAGE_KEY}"]`, error)
    return []
  }
}

/** Writes todos to localStorage. Errors (quota, disabled storage) are logged, not thrown. */
export function saveTodos(todos: Todo[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (error) {
    console.warn(`Could not save localStorage["${STORAGE_KEY}"]`, error)
  }
}
