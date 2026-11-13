import test from 'node:test';
import assert from 'node:assert/strict';
import { isDateKey, isProgressBackup } from './progress.js';

const validBackup = {
  version: 1,
  exportedAt: '2026-11-13T00:00:00.000Z',
  data: {
    courses: [{ id: 1, name: 'JavaScript', category: 'Programming', level: 'Beginner', progress: 25, lessons: '5/20', color: 'yellow', icon: 'JS' }],
    challenges: [{ id: 1, title: 'Arrays', topic: 'JavaScript', difficulty: 'Easy', points: 20, question: 'Question?', options: ['Yes', 'No'], answer: 'Yes', completed: false }],
    projects: [{ id: 'project-1', title: 'Portfolio', description: 'A personal site', stack: ['React'], status: 'In progress', progress: 30, icon: 'P', color: 'blue' }],
    tasks: [{ id: 'task-1', title: 'Practice', detail: '15 min', done: false }],
    activityDates: ['2024-02-29'],
    lifeEvents: [{ id: 'event-1', title: 'Started learning', date: '2024-02-29', category: 'Education', notes: '' }],
    profileName: 'Developer',
    theme: 'dark',
  },
};

test('date keys accept real calendar days, including leap days', () => {
  assert.equal(isDateKey('2024-02-29'), true);
  assert.equal(isDateKey('2023-02-29'), false);
  assert.equal(isDateKey('2024-13-01'), false);
  assert.equal(isDateKey('2024-2-01'), false);
});

test('a complete version 1 progress backup is accepted', () => {
  assert.equal(isProgressBackup(validBackup), true);
});

test('unknown backup versions and malformed course rows are rejected', () => {
  assert.equal(isProgressBackup({ ...validBackup, version: 2 }), false);
  const malformed = structuredClone(validBackup);
  malformed.data.courses[0].lessons = 'finished';
  assert.equal(isProgressBackup(malformed), false);
});

test('invalid calendar dates and oversized collections are rejected', () => {
  const invalidDate = structuredClone(validBackup);
  invalidDate.data.lifeEvents[0].date = '2024-02-30';
  assert.equal(isProgressBackup(invalidDate), false);

  const oversized = structuredClone(validBackup);
  oversized.data.tasks = Array.from({ length: 2001 }, (_, id) => ({ id, title: 'Task', detail: 'Practice', done: false }));
  assert.equal(isProgressBackup(oversized), false);
});
