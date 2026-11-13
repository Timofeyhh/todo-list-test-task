import { useRef, useState } from 'react'
import { TodoFilters } from './components/TodoFilters'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { formatRemaining } from './lib/format'
import type { EmptyMessage, Todo, TodoFilter } from './types'

const EMPTY_MESSAGES: Record<TodoFilter, EmptyMessage> = {
  all: { title: 'Задач пока нет', hint: 'Добавьте первую задачу — она сохранится в браузере' },
  active: { title: 'Активных задач нет', hint: 'Всё сделано — можно добавить новую задачу' },
  completed: { title: 'Выполненных задач нет', hint: 'Отметьте задачу, когда закончите её' },
}

export default function App() {
  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [announcement, setAnnouncement] = useState('')
  const listSectionRef = useRef<HTMLElement>(null)

  // Derived values are computed on every render instead of being stored in state.
  const activeCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - activeCount
  const visibleTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  // When the focused control disappears (deleted or filtered out),
  // move focus to the list section instead of losing it to <body>.
  function focusListSection() {
    listSectionRef.current?.focus()
  }

  function handleAdd(text: string) {
    addTodo(text)
    setAnnouncement(`Задача «${text}» добавлена`)
  }

  function handleToggle(todo: Todo) {
    toggleTodo(todo.id)
    setAnnouncement(
      todo.completed
        ? `Задача «${todo.text}» снова активна`
        : `Задача «${todo.text}» выполнена`,
    )
    if (filter !== 'all') focusListSection()
  }

  function handleDelete(todo: Todo) {
    deleteTodo(todo.id)
    setAnnouncement(`Задача «${todo.text}» удалена`)
    focusListSection()
  }

  function handleClearCompleted() {
    clearCompleted()
    setAnnouncement(`Удалено выполненных задач: ${completedCount}`)
    focusListSection()
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">Список задач</h1>
        <p className="app__subtitle">Простой список, который остаётся после перезагрузки</p>
      </header>

      <div className="card">
        <TodoForm onAdd={handleAdd} />

        <section
          ref={listSectionRef}
          className="todo-section"
          aria-label="Задачи"
          tabIndex={-1}
        >
          {todos.length > 0 && (
            <TodoFilters
              value={filter}
              counts={{ all: todos.length, active: activeCount, completed: completedCount }}
              onChange={setFilter}
            />
          )}

          <TodoList
            todos={visibleTodos}
            emptyMessage={todos.length === 0 ? EMPTY_MESSAGES.all : EMPTY_MESSAGES[filter]}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />

          {todos.length > 0 && (
            <footer className="todo-footer">
              <span className="todo-footer__count">{formatRemaining(activeCount)}</span>
              {completedCount > 0 && (
                <button className="button button--ghost" type="button" onClick={handleClearCompleted}>
                  Удалить выполненные
                </button>
              )}
            </footer>
          )}
        </section>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </main>
  )
}
