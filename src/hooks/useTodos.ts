import { useEffect, useState } from 'react'
import { loadTodos, saveTodos } from '../lib/todoStorage'
import type { Todo } from '../types'

function createId(): string {
  // randomUUID exists only in secure contexts (HTTPS, localhost); fall back for plain HTTP.
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Todo list state, kept in sync with localStorage. */
export function useTodos() {
  // Lazy initializer: localStorage is read once, on the first render.
  const [todos, setTodos] = useState<Todo[]>(loadTodos)

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  function addTodo(text: string) {
    const todo: Todo = {
      id: createId(),
      text,
      completed: false,
      createdAt: Date.now(),
    }
    setTodos((current) => [todo, ...current])
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  return { todos, addTodo, toggleTodo, deleteTodo, clearCompleted }
}
