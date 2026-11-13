import { useId } from 'react'
import { CATEGORIES, type EmptyMessage, type Todo } from '../types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  emptyMessage: EmptyMessage
  onToggle: (todo: Todo) => void
  onChangeCategory: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoList({
  todos,
  emptyMessage,
  onToggle,
  onChangeCategory,
  onDelete,
}: TodoListProps) {
  const idPrefix = useId()

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">{emptyMessage.title}</p>
        <p className="empty-state__hint">{emptyMessage.hint}</p>
      </div>
    )
  }

  // One group per category, urgent first; categories without visible tasks are skipped.
  return (
    <div className="todo-groups">
      {CATEGORIES.map((category) => {
        const items = todos.filter((todo) => todo.category === category.value)
        if (items.length === 0) return null

        const headingId = `${idPrefix}-${category.value}`
        return (
          <section key={category.value} className={`todo-group todo-group--${category.value}`}>
            <h2 id={headingId} className="todo-group__title">
              {category.label}
              <span className="todo-group__count">{items.length}</span>
            </h2>
            <ul className="todo-list" aria-labelledby={headingId}>
              {items.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={onToggle}
                  onChangeCategory={onChangeCategory}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
