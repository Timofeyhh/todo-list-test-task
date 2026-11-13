import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Todo } from '../types'
import { STORAGE_KEY, loadTodos, saveTodos } from './todoStorage'

const validTodo: Todo = { id: '1', text: 'Задача', completed: false, createdAt: 1_700_000_000_000 }

describe('todoStorage', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadTodos()).toEqual([])
  })

  it('reads back what was saved', () => {
    saveTodos([validTodo])
    expect(loadTodos()).toEqual([validTodo])
  })

  it.each([
    ['empty id', { ...validTodo, id: '' }],
    ['blank text', { ...validTodo, text: '   ' }],
    ['string status', { ...validTodo, completed: 'false' }],
    ['missing date', { id: '1', text: 'Задача', completed: false }],
    ['null item', null],
  ])('rejects the whole list if an item has %s', (_, invalidItem) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([validTodo, invalidItem]))
    expect(loadTodos()).toEqual([])
  })

  it('returns an empty list when localStorage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied', 'SecurityError')
    })
    expect(loadTodos()).toEqual([])
  })

  it('does not throw when saving fails, e.g. the quota is exceeded', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError')
    })
    expect(() => saveTodos([validTodo])).not.toThrow()
  })
})
