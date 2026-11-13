import { CATEGORIES, DEFAULT_CATEGORY, type Todo } from '../types'

/**
 * Versioned key: if the data shape ever changes incompatibly, a new key avoids reading stale data.
 * Adding the optional `category` field was backward compatible, so the key stays at v1.
 */
export const STORAGE_KEY = 'todo-list:v1'

function isCategory(value: unknown): value is Todo['category'] {
  return CATEGORIES.some((category) => category.value === value)
}

/**
 * Validates one stored item and returns it in the current shape, or null if it is malformed.
 * Items saved before categories existed have no `category` and become "not urgent".
 */
function parseTodo(value: unknown): Todo | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Record<string, unknown>
  const category = candidate.category === undefined ? DEFAULT_CATEGORY : candidate.category

  if (
    typeof candidate.id === 'string' &&
    candidate.id !== '' &&
    typeof candidate.text === 'string' &&
    candidate.text.trim() !== '' &&
    typeof candidate.completed === 'boolean' &&
    isCategory(category) &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  ) {
    return {
      id: candidate.id,
      text: candidate.text,
      completed: candidate.completed,
      category,
      createdAt: candidate.createdAt,
    }
  }

  return null
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
    if (Array.isArray(parsed)) {
      const todos = parsed.map(parseTodo)
      if (todos.every((todo) => todo !== null)) {
        return todos
      }
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
