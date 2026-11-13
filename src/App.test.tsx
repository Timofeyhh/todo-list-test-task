import { render, screen, within } from '@testing-library/react'
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
      {
        id: 'a',
        text: 'Из хранилища',
        completed: false,
        category: 'normal',
        createdAt: Date.UTC(2026, 0, 10),
      },
      {
        id: 'b',
        text: 'Уже сделано',
        completed: true,
        category: 'urgent',
        createdAt: Date.UTC(2026, 0, 9),
      },
    ]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'Из хранилища' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Уже сделано' })).toBeChecked()
    expect(screen.getByText('Осталась 1 задача')).toBeInTheDocument()
  })

  it('adds tasks as "not urgent" by default and shows them in their own group', async () => {
    const { user } = renderApp()

    expect(screen.getByRole('radio', { name: 'Не срочно' })).toBeChecked()
    await addTodo(user, 'Разобрать почту')

    const group = screen.getByRole('list', { name: /Не срочно/ })
    expect(within(group).getByRole('checkbox', { name: 'Разобрать почту' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: /^Срочно/ })).not.toBeInTheDocument()
    expect(readStoredTodos()[0]?.category).toBe('normal')
  })

  it('adds an urgent task to the urgent group, which is shown first', async () => {
    const { user } = renderApp()
    await addTodo(user, 'Позвонить позже')

    await user.click(screen.getByRole('radio', { name: 'Срочно' }))
    await addTodo(user, 'Сдать отчёт')

    const groups = screen.getAllByRole('list')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAccessibleName(/^Срочно/)
    expect(within(groups[0]!).getByRole('checkbox', { name: 'Сдать отчёт' })).toBeInTheDocument()
    expect(groups[1]).toHaveAccessibleName(/^Не срочно/)
    expect(within(groups[1]!).getByRole('checkbox', { name: 'Позвонить позже' })).toBeInTheDocument()
    expect(readStoredTodos().map((todo) => `${todo.text}:${todo.category}`)).toEqual([
      'Сдать отчёт:urgent',
      'Позвонить позже:normal',
    ])
  })

  it('keeps the selected category for the next task and restores groups after a reload', async () => {
    const { user, unmount } = renderApp()
    await user.click(screen.getByRole('radio', { name: 'Срочно' }))
    await addTodo(user, 'Первая срочная')
    expect(screen.getByRole('radio', { name: 'Срочно' })).toBeChecked()

    unmount()
    render(<App />)

    const group = screen.getByRole('list', { name: /^Срочно/ })
    expect(within(group).getByRole('checkbox', { name: 'Первая срочная' })).toBeInTheDocument()
  })

  it('moves an existing task to the other category and back, keeping the focus on its button', async () => {
    const { user } = renderApp()
    await addTodo(user, 'Переносимая')

    await user.click(screen.getByRole('button', { name: 'Сделать задачу «Переносимая» срочной' }))

    const urgent = screen.getByRole('list', { name: /^Срочно/ })
    expect(within(urgent).getByRole('checkbox', { name: 'Переносимая' })).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: /^Не срочно/ })).not.toBeInTheDocument()
    expect(readStoredTodos()[0]?.category).toBe('urgent')
    const back = screen.getByRole('button', { name: 'Сделать задачу «Переносимая» не срочной' })
    expect(back).toHaveFocus()

    await user.click(back)

    const normal = screen.getByRole('list', { name: /^Не срочно/ })
    expect(within(normal).getByRole('checkbox', { name: 'Переносимая' })).toBeInTheDocument()
    expect(readStoredTodos()[0]?.category).toBe('normal')
  })

  it('shows how many active and completed tasks are urgent and not urgent', async () => {
    const { user } = renderApp()
    await user.click(screen.getByRole('radio', { name: 'Срочно' }))
    await addTodo(user, 'Срочная 1')
    await addTodo(user, 'Срочная 2')
    await user.click(screen.getByRole('radio', { name: 'Не срочно' }))
    await addTodo(user, 'Обычная')
    await user.click(screen.getByRole('checkbox', { name: 'Срочная 2' }))

    expect(screen.getByText('Активные', { selector: 'dt' }).parentElement).toHaveTextContent(
      /Активные\s*2\s*Срочно\s*1\s*Не срочно\s*1/,
    )
    expect(screen.getByText('Выполненные', { selector: 'dt' }).parentElement).toHaveTextContent(
      /Выполненные\s*1\s*Срочно\s*1\s*Не срочно\s*0/,
    )
  })

  it('shows tasks saved without a category as "not urgent"', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'old', text: 'Старая задача', completed: false, createdAt: 1 }]),
    )

    render(<App />)

    const group = screen.getByRole('list', { name: /^Не срочно/ })
    expect(within(group).getByRole('checkbox', { name: 'Старая задача' })).toBeInTheDocument()
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
