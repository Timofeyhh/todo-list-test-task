import type { EmptyMessage, Todo } from '../types'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  emptyMessage: EmptyMessage
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

export function TodoList({ todos, emptyMessage, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__icon" aria-hidden="true">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="4" width="16" height="16" rx="4" />
            <path d="M8.5 12.5l2.25 2.25L15.5 10" />
          </svg>
        </span>
        <p className="empty-state__title">{emptyMessage.title}</p>
        <p className="empty-state__hint">{emptyMessage.hint}</p>
      </div>
    )
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
