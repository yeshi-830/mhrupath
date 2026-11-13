function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isSavedCourse(item) {
  return isRecord(item) && Number.isFinite(item.id) && typeof item.name === 'string' &&
    typeof item.category === 'string' && typeof item.level === 'string' &&
    Number.isFinite(item.progress) && item.progress >= 0 && item.progress <= 100 &&
    /^\d+\/\d+$/.test(item.lessons) && typeof item.color === 'string' && typeof item.icon === 'string';
}

export function isSavedChallenge(item) {
  return isRecord(item) && Number.isFinite(item.id) && typeof item.title === 'string' &&
    typeof item.topic === 'string' && typeof item.difficulty === 'string' &&
    Number.isFinite(item.points) && item.points >= 0 && typeof item.question === 'string' &&
    Array.isArray(item.options) && item.options.every((option) => typeof option === 'string') &&
    item.options.includes(item.answer) && typeof item.completed === 'boolean';
}

export function isSavedProject(item) {
  return isRecord(item) && (Number.isFinite(item.id) || typeof item.id === 'string') && typeof item.title === 'string' &&
    typeof item.description === 'string' && Array.isArray(item.stack) &&
    item.stack.every((tag) => typeof tag === 'string') &&
    ['Not started', 'In progress', 'Completed'].includes(item.status) &&
    Number.isFinite(item.progress) && item.progress >= 0 && item.progress <= 100 &&
    typeof item.icon === 'string' && typeof item.color === 'string';
}

export function isSavedTask(item) {
  return isRecord(item) && (Number.isFinite(item.id) || typeof item.id === 'string') &&
    typeof item.title === 'string' && typeof item.detail === 'string' && typeof item.done === 'boolean';
}

export function isSavedLifeEvent(item) {
  return isRecord(item) && (Number.isFinite(item.id) || typeof item.id === 'string') &&
    typeof item.title === 'string' && isDateKey(item.date) && typeof item.category === 'string' &&
    typeof item.notes === 'string';
}

export function isProgressBackup(value) {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.data)) return false;
  const { courses, challenges, projects, tasks, activityDates, lifeEvents, profileName, theme } = value.data;
  const boundedList = (items, validator, limit = 2000) =>
    Array.isArray(items) && items.length <= limit && items.every(validator);

  return boundedList(courses, isSavedCourse) &&
    boundedList(challenges, isSavedChallenge) &&
    boundedList(projects, isSavedProject) &&
    boundedList(tasks, isSavedTask) &&
    boundedList(activityDates, isDateKey) &&
    boundedList(lifeEvents, isSavedLifeEvent) &&
    typeof profileName === 'string' && profileName.length <= 40 &&
    ['dark', 'light'].includes(theme);
}
