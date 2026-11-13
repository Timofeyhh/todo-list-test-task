import { CATEGORIES, type TodoCategory } from '../types'

interface StatsItemProps {
  label: string
  total: number
  /** How many of the `total` tasks are urgent / not urgent. */
  byCategory: Record<TodoCategory, number>
}

/** One counter of the info column: a big number and its split by category. */
export function StatsItem({ label, total, byCategory }: StatsItemProps) {
  return (
    <div className="stats__item">
      <dt className="stats__label">{label}</dt>
      <dd className="stats__value">{total}</dd>
      <dd className="stats__split">
        {CATEGORIES.map((category) => (
          <span
            key={category.value}
            className={`stats__split-item stats__split-item--${category.value}`}
          >
            <span className="stats__split-label">{category.label}</span>
            <span className="stats__split-count">{byCategory[category.value]}</span>
          </span>
        ))}
      </dd>
    </div>
  )
}
