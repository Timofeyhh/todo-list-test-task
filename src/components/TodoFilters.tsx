import type { TodoFilter } from '../types'

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

interface TodoFiltersProps {
  value: TodoFilter
  counts: Record<TodoFilter, number>
  onChange: (filter: TodoFilter) => void
}

export function TodoFilters({ value, counts, onChange }: TodoFiltersProps) {
  return (
    <div className="filters" role="group" aria-label="Показать задачи">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className="filters__button"
          type="button"
          aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}{' '}
          <span className="filters__count">{counts[filter.value]}</span>
        </button>
      ))}
    </div>
  )
}
