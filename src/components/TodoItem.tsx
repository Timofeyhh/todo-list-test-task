import { useId } from 'react'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onChangeCategory: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoItem({ todo, onToggle, onChangeCategory, onDelete }: TodoItemProps) {
  const checkboxId = useId()
  const className = todo.completed ? 'todo-item todo-item--completed' : 'todo-item'
  const isUrgent = todo.category === 'urgent'
  const categoryTitle = isUrgent ? 'Сделать не срочной' : 'Сделать срочной'
  const categoryLabel = isUrgent
    ? `Сделать задачу «${todo.text}» не срочной`
    : `Сделать задачу «${todo.text}» срочной`

  return (
    <li className={className} data-todo-id={todo.id}>
      {/* The whole label is a large click/tap target for the checkbox. */}
      <label className="todo-item__main" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
        />
        <span className="todo-item__text">{todo.text}</span>
      </label>
      <div className="todo-item__actions">
        {/* The arrow points to the group the task moves to: up = urgent, down = not urgent. */}
        <button
          className="icon-button todo-item__category"
          type="button"
          onClick={() => onChangeCategory(todo)}
          aria-label={categoryLabel}
          title={categoryTitle}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {isUrgent ? <path d="M7 1v12M2 8l5 5 5-5" /> : <path d="M7 13V1M2 6l5-5 5 5" />}
          </svg>
        </button>
        <button
          className="icon-button todo-item__delete"
          type="button"
          onClick={() => onDelete(todo)}
          aria-label={`Удалить задачу «${todo.text}»`}
          title="Удалить задачу"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>
    </li>
  )
}
