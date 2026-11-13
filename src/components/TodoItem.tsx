import { useId } from 'react'
import { formatCreatedAt } from '../lib/format'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const checkboxId = useId()
  const dateId = useId()
  const className = todo.completed ? 'todo-item todo-item--completed' : 'todo-item'

  return (
    <li className={className}>
      {/* The whole label is a large click/tap target for the checkbox. */}
      <label className="todo-item__main" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          aria-describedby={dateId}
        />
        <span className="todo-item__content">
          <span className="todo-item__text">{todo.text}</span>
          {/* Hidden from the checkbox name (name = task text), announced as its description instead. */}
          <time
            id={dateId}
            className="todo-item__date"
            dateTime={new Date(todo.createdAt).toISOString()}
            aria-hidden="true"
          >
            Создана {formatCreatedAt(todo.createdAt)}
          </time>
        </span>
      </label>
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
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M9 7V4h6v3" />
        </svg>
      </button>
    </li>
  )
}
