import { describe, expect, it } from 'vitest'
import { formatRemaining } from './format'

describe('formatRemaining', () => {
  it.each([
    [0, 'Все задачи выполнены'],
    [1, 'Осталась 1 задача'],
    [2, 'Осталось 2 задачи'],
    [5, 'Осталось 5 задач'],
    [11, 'Осталось 11 задач'],
    [21, 'Осталась 21 задача'],
    [24, 'Осталось 24 задачи'],
  ])('formats %i correctly in Russian', (count, expected) => {
    expect(formatRemaining(count)).toBe(expected)
  })
})
