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
