import { render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { STORAGE_KEY } from './lib/todoStorage'
import type { Todo } from './types'

function renderApp() {
  const user = userEvent.setup()
  return { user, ...render(<App />) }
}

function getInput() {
  return screen.getByLabelText('Новая задача')
}

async function addTodo(user: UserEvent, text: string) {
  await user.type(getInput(), `${text}{Enter}`)
}

function readStoredTodos(): Todo[] {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Todo[]
}

describe('App', () => {
  it('adds a task by pressing Enter, clears the field and saves the task', async () => {
    const { user } = renderApp()

    await addTodo(user, 'Купить молоко')

    expect(screen.getByRole('checkbox', { name: 'Купить молоко' })).not.toBeChecked()
    expect(getInput()).toHaveValue('')
    expect(getInput()).toHaveFocus()
    expect(readStoredTodos()).toEqual([
      expect.objectContaining({ text: 'Купить молоко', completed: false }),
    ])
  })

  it('adds a task with the button and trims surrounding spaces', async () => {
    const { user } = renderApp()

    await user.type(getInput(), '   Позвонить врачу   ')
    await user.click(screen.getByRole('button', { name: 'Добавить' }))

    expect(screen.getByRole('checkbox', { name: 'Позвонить врачу' })).toBeInTheDocument()
    expect(readStoredTodos()[0]?.text).toBe('Позвонить врачу')
  })

  it('does not add an empty or whitespace-only task', async () => {
    const { user } = renderApp()

    await user.click(screen.getByRole('button', { name: 'Добавить' }))
    await user.type(getInput(), '    {Enter}')

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('пустую задачу добавить нельзя')
    expect(getInput()).toHaveAttribute('aria-invalid', 'true')
    expect(readStoredTodos()).toEqual([])
  })

  it('marks a task as completed and returns it to active', async () => {
    const { user } = renderApp()
    await addTodo(user, 'Написать отчёт')
    const checkbox = screen.getByRole('checkbox', { name: 'Написать отчёт' })

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    expect(readStoredTodos()[0]?.completed).toBe(true)
    expect(screen.getByText('Все задачи выполнены')).toBeInTheDocument()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
    expect(readStoredTodos()[0]?.completed).toBe(false)
    expect(screen.getByText('Осталась 1 задача')).toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const { user } = renderApp()
    await addTodo(user, 'Первая')
    await addTodo(user, 'Вторая')

    await user.click(screen.getByRole('button', { name: 'Удалить задачу «Первая»' }))

    expect(screen.queryByRole('checkbox', { name: 'Первая' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Вторая' })).toBeInTheDocument()
    expect(readStoredTodos().map((todo) => todo.text)).toEqual(['Вторая'])
  })

  it('filters tasks and clears completed ones', async () => {
    const { user } = renderApp()
    await addTodo(user, 'Активная')
    await addTodo(user, 'Готовая')
    await user.click(screen.getByRole('checkbox', { name: 'Готовая' }))

    await user.click(screen.getByRole('button', { name: /^Активные/ }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    expect(screen.getByRole('checkbox', { name: 'Активная' })).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: /^Выполненные/ }))
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    expect(screen.getByRole('checkbox', { name: 'Готовая' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Удалить выполненные' }))
    expect(screen.getByText('Выполненных задач нет')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Удалить выполненные' })).not.toBeInTheDocument()
    expect(readStoredTodos().map((todo) => todo.text)).toEqual(['Активная'])
  })

  it('keeps tasks after the app is mounted again, as after a page reload', async () => {
    const { user, unmount } = renderApp()
    await addTodo(user, 'Не забыть')
    await user.click(screen.getByRole('checkbox', { name: 'Не забыть' }))

    unmount()
    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'Не забыть' })).toBeChecked()
  })

  it('restores tasks saved in localStorage', () => {
    const saved: Todo[] = [
      { id: 'a', text: 'Из хранилища', completed: false, createdAt: Date.UTC(2026, 0, 10) },
      { id: 'b', text: 'Уже сделано', completed: true, createdAt: Date.UTC(2026, 0, 9) },
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'Из хранилища' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Уже сделано' })).toBeChecked()
    expect(screen.getByText('Осталась 1 задача')).toBeInTheDocument()
  })

  it.each([
    ['invalid JSON', '{not valid json'],
    ['an object instead of an array', '{"id":"1","text":"x"}'],
    ['items with a wrong shape', '[{"id":1,"title":"x"}]'],
  ])('starts with an empty list when localStorage contains %s', async (_, raw) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    window.localStorage.setItem(STORAGE_KEY, raw)

    const { user } = renderApp()

    expect(screen.getByText('Задач пока нет')).toBeInTheDocument()
    await addTodo(user, 'Новая задача после сбоя')
    expect(screen.getByRole('checkbox', { name: 'Новая задача после сбоя' })).toBeInTheDocument()
  })
})
