import { useId, useRef } from 'react'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const checkboxId = useId()
  const itemRef = useRef<HTMLLIElement>(null)
  const isRemoving = useRef(false)
  const className = todo.completed ? 'todo-item todo-item--completed' : 'todo-item'

  // Plays a short collapse animation, then removes the task.
  // Without animation support (tests, old browsers) or with reduced motion
  // the task is removed immediately.
  function handleDelete() {
    if (isRemoving.current) return
    isRemoving.current = true

    const item = itemRef.current
    if (!item || typeof item.animate !== 'function' || prefersReducedMotion()) {
      onDelete(todo)
      return
    }

    item.style.overflow = 'hidden'
    const animation = item.animate(
      [
        { opacity: 1, height: `${item.offsetHeight}px` },
        { opacity: 0, height: '0px', paddingTop: '0px', paddingBottom: '0px', borderTopWidth: '0px' },
      ],
      { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
    )
    animation.finished.catch(() => undefined).then(() => onDelete(todo))
  }

  return (
    <li ref={itemRef} className={className}>
      {/* The whole label is a large click/tap target for the checkbox. */}
      <label className="todo-item__main" htmlFor={checkboxId}>
        <input
          id={checkboxId}
          className="todo-item__checkbox"
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
        />
        <span className="todo-item__text">
          {/* Inline span so the strike-through line follows every wrapped line. */}
          <span className="todo-item__label">{todo.text}</span>
        </span>
      </label>
      <button
        className="icon-button todo-item__delete"
        type="button"
        onClick={handleDelete}
        aria-label={`Удалить задачу «${todo.text}»`}
        title="Удалить задачу"
      >
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
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
