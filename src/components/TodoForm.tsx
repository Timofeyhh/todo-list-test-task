import { useId, useRef, useState, type FormEvent } from 'react'
import { CATEGORIES, DEFAULT_CATEGORY, type TodoCategory } from '../types'

const MAX_LENGTH = 500

interface TodoFormProps {
  onAdd: (text: string, category: TodoCategory) => void
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<TodoCategory>(DEFAULT_CATEGORY)
  const [showError, setShowError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const errorId = useId()
  const categoryLabelId = useId()
  const categoryName = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()

    if (trimmed === '') {
      setShowError(true)
    } else {
      onAdd(trimmed, category)
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
          placeholder="Например, купить продукты"
          maxLength={MAX_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
        <button className="button button--primary" type="submit">
          Добавить
        </button>
      </div>
      {showError && (
        <p id={errorId} className="todo-form__error" role="alert">
          <span className="todo-form__error-mark" aria-hidden="true">
            ×
          </span>
          Введите текст задачи — пустую задачу добавить нельзя.
        </p>
      )}

      {/* Native radio buttons: arrow keys and screen readers work out of the box. */}
      <div className="category" role="radiogroup" aria-labelledby={categoryLabelId}>
        <span id={categoryLabelId} className="category__label">
          Категория
        </span>
        <div className="category__options">
          {CATEGORIES.map((option) => (
            <label key={option.value} className="category__option">
              <input
                className="category__input"
                type="radio"
                name={categoryName}
                value={option.value}
                checked={category === option.value}
                onChange={() => setCategory(option.value)}
              />
              <span className="category__text">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </form>
  )
}
