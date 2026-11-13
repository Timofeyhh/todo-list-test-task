import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Todo } from '../types'
import { STORAGE_KEY, loadTodos, saveTodos } from './todoStorage'

const validTodo: Todo = {
  id: '1',
  text: 'Задача',
  completed: false,
  category: 'urgent',
  createdAt: 1_700_000_000_000,
}

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
    ['missing date', { id: '1', text: 'Задача', completed: false, category: 'normal' }],
    ['unknown category', { ...validTodo, category: 'someday' }],
    ['null category', { ...validTodo, category: null }],
    ['null item', null],
  ])('rejects the whole list if an item has %s', (_, invalidItem) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([validTodo, invalidItem]))
    expect(loadTodos()).toEqual([])
  })

  it('treats tasks saved before categories existed as "not urgent"', () => {
    const legacy = { id: '2', text: 'Старая задача', completed: true, createdAt: 1_600_000_000_000 }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([legacy]))

    expect(loadTodos()).toEqual([{ ...legacy, category: 'normal' }])
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
