import { useEffect, useRef, useState } from 'react'
import { StatsItem } from './components/StatsItem'
import { TodoFilters } from './components/TodoFilters'
import { TodoForm } from './components/TodoForm'
import { TodoList } from './components/TodoList'
import { useTodos } from './hooks/useTodos'
import { formatRemaining } from './lib/format'
import { CATEGORIES, type EmptyMessage, type Todo, type TodoCategory, type TodoFilter } from './types'

const EMPTY_MESSAGES: Record<TodoFilter, EmptyMessage> = {
  all: { title: 'Задач пока нет', hint: 'Добавьте первую — она сохранится в браузере' },
  active: { title: 'Активных задач нет', hint: 'Всё сделано — можно добавить новую задачу' },
  completed: { title: 'Выполненных задач нет', hint: 'Отметьте задачу, когда закончите её' },
}

function countByCategory(todos: Todo[]): Record<TodoCategory, number> {
  return {
    urgent: todos.filter((todo) => todo.category === 'urgent').length,
    normal: todos.filter((todo) => todo.category === 'normal').length,
  }
}

export default function App() {
  const { todos, addTodo, toggleTodo, setTodoCategory, deleteTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [announcement, setAnnouncement] = useState('')
  const listSectionRef = useRef<HTMLElement>(null)
  // A task that changes category moves to another group, so its row is re-created;
  // this remembers which task should get the keyboard focus back.
  const pendingFocusId = useRef<string | null>(null)

  // Derived values are computed on every render instead of being stored in state.
  const activeTodos = todos.filter((todo) => !todo.completed)
  const completedTodos = todos.filter((todo) => todo.completed)
  const activeCount = activeTodos.length
  const completedCount = completedTodos.length
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

  // After a task moved to another category group, focus its category button again.
  useEffect(() => {
    const id = pendingFocusId.current
    if (id === null) return
    pendingFocusId.current = null

    const rows = listSectionRef.current?.querySelectorAll<HTMLElement>('[data-todo-id]') ?? []
    const row = Array.from(rows).find((element) => element.dataset.todoId === id)
    row?.querySelector<HTMLElement>('.todo-item__category')?.focus()
  })

  function handleAdd(text: string, category: TodoCategory) {
    addTodo(text, category)
    const label = CATEGORIES.find((item) => item.value === category)?.label ?? ''
    setAnnouncement(`Задача «${text}» добавлена. Категория: ${label}`)
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

  function handleChangeCategory(todo: Todo) {
    const next: TodoCategory = todo.category === 'urgent' ? 'normal' : 'urgent'
    const label = CATEGORIES.find((item) => item.value === next)?.label ?? ''
    setTodoCategory(todo.id, next)
    pendingFocusId.current = todo.id
    setAnnouncement(`Задача «${todo.text}» перенесена в категорию «${label}»`)
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
    <div className="page">
      <main className="container layout">
        <div className="intro">
          <p className="eyebrow">Тестовое задание · 2026</p>
          <h1 className="intro__title">Что делаем сегодня?</h1>
          <p className="intro__text">
            Запишите дела на сегодня и отметьте, какие из них срочные. Остальные подождут.
          </p>
          <dl className="stats">
            <StatsItem label="Активные" total={activeCount} byCategory={countByCategory(activeTodos)} />
            <StatsItem
              label="Выполненные"
              total={completedCount}
              byCategory={countByCategory(completedTodos)}
            />
          </dl>
        </div>

        <div className="board">
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
              onChangeCategory={handleChangeCategory}
              onDelete={handleDelete}
            />

            {todos.length > 0 && (
              <footer className="todo-footer">
                <span className="todo-footer__count">{formatRemaining(activeCount)}</span>
                {completedCount > 0 && (
                  <button
                    className="button button--outline"
                    type="button"
                    onClick={handleClearCompleted}
                  >
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

      <footer className="container site-footer">
        <div className="site-footer__inner">
          <p>Данные хранятся локально</p>
          <p>React · TypeScript · Vite</p>
        </div>
      </footer>
    </div>
  )
}
