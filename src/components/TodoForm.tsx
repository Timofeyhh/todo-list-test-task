import { useId, useRef, useState, type FormEvent } from 'react'

const MAX_LENGTH = 500

interface TodoFormProps {
  onAdd: (text: string) => void
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('')
  const [showError, setShowError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed === '') {
      setShowError(true)
    } else {
      onAdd(trimmed)
      setShowError(false)
    }

    setText('')
    inputRef.current?.focus()
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label className="todo-form__label" htmlFor={inputId}>
        Новая задача
      </label>
      <div className="todo-form__row">
        <input
          ref={inputRef}
          id={inputId}
          className="todo-form__input"
          type="text"
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            if (showError) setShowError(false)
          }}
          placeholder="Что нужно сделать?"
          maxLength={MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
        <button className="button button--primary" type="submit">
          <svg
            aria-hidden="true"
            focusable="false"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Добавить
        </button>
      </div>
      {showError && (
        <p id={errorId} className="todo-form__error" role="alert">
          Введите текст задачи — пустую задачу добавить нельзя.
        </p>
      )}
    </form>
  )
}
