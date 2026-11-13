const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const dateWithYearFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "13 нояб., 14:05"; the year is shown only for dates outside the current year. */
export function formatCreatedAt(timestamp: number, now = new Date()): string {
  const date = new Date(timestamp)
  const format = date.getFullYear() === now.getFullYear() ? dateFormat : dateWithYearFormat
  return format.format(date)
}

const pluralRules = new Intl.PluralRules('ru-RU')

/** "Осталась 1 задача", "Осталось 3 задачи", "Осталось 5 задач". */
export function formatRemaining(count: number): string {
  if (count === 0) {
    return 'Все задачи выполнены'
  }

  switch (pluralRules.select(count)) {
    case 'one':
      return `Осталась ${count} задача`
    case 'few':
      return `Осталось ${count} задачи`
    default:
      return `Осталось ${count} задач`
  }
}
