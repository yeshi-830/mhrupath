
import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const initialCourses = [
  { id: 1, name: 'HTML & CSS', category: 'Frontend', level: 'Beginner', progress: 85, color: 'orange', icon: '</>', lessons: '17/20' },
  { id: 2, name: 'JavaScript', category: 'Programming', level: 'Beginner', progress: 60, color: 'yellow', icon: 'JS', lessons: '12/20' },
  { id: 3, name: 'React Development', category: 'Frontend', level: 'Intermediate', progress: 35, color: 'blue', icon: '⚛', lessons: '7/20' },
  { id: 4, name: 'Node.js & Express', category: 'Backend', level: 'Intermediate', progress: 20, color: 'green', icon: '⬡', lessons: '4/20' },
  { id: 5, name: 'SQL & MySQL', category: 'Database', level: 'Beginner', progress: 10, color: 'purple', icon: '▤', lessons: '2/20' },
  { id: 6, name: 'Data Structures', category: 'Computer Science', level: 'Intermediate', progress: 0, color: 'pink', icon: '⌘', lessons: '0/20' },
];

const initialChallenges = [
  { id: 1, title: 'Variables & Data Types', topic: 'JavaScript', difficulty: 'Easy', points: 20, question: 'Which keyword declares a block-scoped variable that can be reassigned?', options: ['const', 'let', 'static', 'define'], answer: 'let', completed: false },
  { id: 2, title: 'Array Fundamentals', topic: 'JavaScript', difficulty: 'Easy', points: 30, question: 'Which method adds an item to the end of a JavaScript array?', options: ['shift()', 'pop()', 'push()', 'slice()'], answer: 'push()', completed: false },
  { id: 3, title: 'React Components', topic: 'React', difficulty: 'Medium', points: 50, question: 'Which hook is commonly used to manage component state?', options: ['useRoute', 'useState', 'useStyle', 'usePage'], answer: 'useState', completed: false },
];

const initialProjects = [
  { id: 1, title: 'Personal Portfolio', description: 'Create a responsive portfolio to showcase your skills and work.', stack: ['React', 'CSS'], status: 'In progress', progress: 65, icon: '◈', color: 'blue' },
  { id: 2, title: 'Task Manager', description: 'Build a task manager with filters and saved tasks.', stack: ['JavaScript', 'CSS'], status: 'In progress', progress: 35, icon: '✓', color: 'green' },
  { id: 3, title: 'Weather Dashboard', description: 'Practice APIs and display weather information.', stack: ['React', 'API'], status: 'Not started', progress: 0, icon: '☁', color: 'purple' },
  { id: 4, title: 'Student Registration', description: 'Create a full-stack registration application.', stack: ['Node.js', 'MySQL'], status: 'Not started', progress: 0, icon: '▤', color: 'orange' },
];

const initialTasks = [
  { id: 1, title: 'Review JavaScript variables', detail: 'JavaScript · 15 min', done: false },
  { id: 2, title: 'Complete an array challenge', detail: 'Practice · 20 min', done: false },
  { id: 3, title: 'Build a portfolio section', detail: 'Project · 25 min', done: false },
  { id: 4, title: 'Review yesterday’s notes', detail: 'Revision · 10 min', done: true },
];

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return getDateKey(new Date());
}

function getTodayDisplay() {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
}

function formatLifeEventDate(dateKey) {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${dateKey}T12:00:00`));
}

function getWeekDates(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return weekdays.map((label, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return { label, date: day, key: getDateKey(day) };
  });
}

function getWeekDatesForKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return getWeekDates(new Date(year, month - 1, day));
}

function getPreviousDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return getDateKey(new Date(year, month - 1, day - 1));
}

function getActivityStreak(activityDates, todayKey) {
  const activeDates = new Set(activityDates);
  let dateKey = activeDates.has(todayKey) ? todayKey : getPreviousDateKey(todayKey);
  let streak = 0;

  while (activeDates.has(dateKey)) {
    streak += 1;
    dateKey = getPreviousDateKey(dateKey);
  }

  return streak;
}

const navGroups = [
  { label: 'WORKSPACE', items: [{ id: 'Dashboard', icon: '▦' }, { id: 'Learning Paths', icon: '◫' }, { id: 'Challenges', icon: '⌘' }, { id: 'My Projects', icon: '▣' }] },
  { label: 'YOUR JOURNEY', items: [{ id: 'My Progress', icon: '▥' }, { id: 'Life Timeline', icon: '◷' }, { id: 'Leaderboard', icon: '♜' }, { id: 'Community', icon: '◎' }] },
];

function readSaved(key, fallback) {
  try {
    const value = localStorage.getItem(`mhrupath-${key}`);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveValue(key, value) {
  try {
    localStorage.setItem(`mhrupath-${key}`, JSON.stringify(value));
  } catch {
    // The application can still run if browser storage is unavailable.
  }
}

function readSavedList(key, fallback, isValidItem) {
  const value = readSaved(key, fallback);
  return Array.isArray(value) ? value.filter(isValidItem) : fallback;
}

function isSavedCourse(item) {
  return isRecord(item) && Number.isFinite(item.id) && typeof item.name === 'string' &&
    typeof item.category === 'string' && typeof item.level === 'string' &&
    Number.isFinite(item.progress) && item.progress >= 0 && item.progress <= 100 &&
    /^\d+\/\d+$/.test(item.lessons) && typeof item.color === 'string' && typeof item.icon === 'string';
}

function isSavedChallenge(item) {
  return isRecord(item) && Number.isFinite(item.id) && typeof item.title === 'string' &&
    typeof item.topic === 'string' && typeof item.difficulty === 'string' &&
    Number.isFinite(item.points) && item.points >= 0 && typeof item.question === 'string' &&
    Array.isArray(item.options) && item.options.every((option) => typeof option === 'string') &&
    item.options.includes(item.answer) && typeof item.completed === 'boolean';
}

function isSavedProject(item) {
  return isRecord(item) && Number.isFinite(item.id) && typeof item.title === 'string' &&
    typeof item.description === 'string' && Array.isArray(item.stack) &&
    item.stack.every((tag) => typeof tag === 'string') &&
    ['Not started', 'In progress', 'Completed'].includes(item.status) &&
    Number.isFinite(item.progress) && item.progress >= 0 && item.progress <= 100 &&
    typeof item.icon === 'string' && typeof item.color === 'string';
}

function isSavedTask(item) {
  return isRecord(item) && (Number.isFinite(item.id) || typeof item.id === 'string') &&
    typeof item.title === 'string' && typeof item.detail === 'string' && typeof item.done === 'boolean';
}

function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isSavedLifeEvent(item) {
  return isRecord(item) && (Number.isFinite(item.id) || typeof item.id === 'string') &&
    typeof item.title === 'string' && isDateKey(item.date) && typeof item.category === 'string' &&
    typeof item.notes === 'string';
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isProgressBackup(value) {
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

function ProgressBar({ value, color = 'blue' }) {
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
      <div className={`progress-fill ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="muted">{description}</p>}
      </div>
      {action && <button className="text-button" onClick={onAction}>{action} ↗</button>}
    </div>
  );
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [theme, setTheme] = useState(() => {
    const savedTheme = readSaved('theme', 'dark');
    return ['dark', 'light'].includes(savedTheme) ? savedTheme : 'dark';
  });
  const [courses, setCourses] = useState(() => readSavedList('courses', initialCourses, isSavedCourse));
  const [challenges, setChallenges] = useState(() => readSavedList('challenges', initialChallenges, isSavedChallenge));
  const [projects, setProjects] = useState(() => readSavedList('projects', initialProjects, isSavedProject));
  const [tasks, setTasks] = useState(() => readSavedList('tasks', initialTasks, isSavedTask));
  const [activityDates, setActivityDates] = useState(() => readSavedList('activity-dates', [], isDateKey));
  const [lifeEvents, setLifeEvents] = useState(() => readSavedList('life-events', [], isSavedLifeEvent));
  const [todayKey, setTodayKey] = useState(getTodayKey);
  const [todayDisplay, setTodayDisplay] = useState(getTodayDisplay);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [category, setCategory] = useState('All');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileName, setProfileName] = useState(() => {
    const savedName = readSaved('name', 'Developer');
    return typeof savedName === 'string' ? savedName.slice(0, 40) : 'Developer';
  });
  const [newTask, setNewTask] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectStack, setNewProjectStack] = useState('');
  const [showLifeEventForm, setShowLifeEventForm] = useState(false);
  const [editingLifeEventId, setEditingLifeEventId] = useState(null);
  const [lifeEventTitle, setLifeEventTitle] = useState('');
  const [lifeEventDate, setLifeEventDate] = useState(getTodayKey);
  const [lifeEventCategory, setLifeEventCategory] = useState('Personal');
  const [lifeEventNotes, setLifeEventNotes] = useState('');
  const [settingsFeedback, setSettingsFeedback] = useState('');
  const searchInputRef = useRef(null);
  const backupInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveValue('theme', theme);
  }, [theme]);

  useEffect(() => saveValue('courses', courses), [courses]);
  useEffect(() => saveValue('challenges', challenges), [challenges]);
  useEffect(() => saveValue('projects', projects), [projects]);
  useEffect(() => saveValue('tasks', tasks), [tasks]);
  useEffect(() => saveValue('activity-dates', activityDates), [activityDates]);
  useEffect(() => saveValue('life-events', lifeEvents), [lifeEvents]);
  useEffect(() => saveValue('name', profileName), [profileName]);
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTodayKey(getTodayKey());
      setTodayDisplay(getTodayDisplay());
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMobileMenu(false);
        setMobileSearchOpen(false);
        setSearchFocused(false);
        setShowNotifications(false);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setMobileSearchOpen(true);
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const completedChallenges = challenges.filter((item) => item.completed).length;
  const completedTasks = tasks.filter((task) => task.done).length;
  const pendingTasks = tasks.filter((task) => !task.done).length;
  const availableChallenges = challenges.filter((item) => !item.completed).length;
  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;
  const earnedPoints = challenges.filter((item) => item.completed).reduce((sum, item) => sum + item.points, 0);
  const completedLessons = courses.reduce((sum, course) => sum + Number(course.lessons.split('/')[0]), 0);

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesQuery = `${course.name} ${course.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All' || course.category === category;
    return matchesQuery && matchesCategory;
  }), [courses, query, category]);

  const filteredChallenges = useMemo(() => challenges.filter((item) =>
    `${item.title} ${item.topic} ${item.difficulty}`.toLowerCase().includes(query.toLowerCase())
  ), [challenges, query]);

  const filteredProjects = useMemo(() => projects.filter((item) =>
    `${item.title} ${item.description} ${item.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  ), [projects, query]);

  const filteredLifeEvents = useMemo(() => lifeEvents.filter((item) =>
    `${item.title} ${item.category} ${item.notes}`.toLowerCase().includes(query.toLowerCase())
  ), [lifeEvents, query]);

  const globalSearchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return [
      ...courses.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery))
        .map((item) => ({ title: item.name, detail: `Learning path · ${item.category}`, page: 'Learning Paths' })),
      ...challenges.filter((item) => `${item.title} ${item.topic} ${item.difficulty}`.toLowerCase().includes(normalizedQuery))
        .map((item) => ({ title: item.title, detail: `Challenge · ${item.topic}`, page: 'Challenges' })),
      ...projects.filter((item) => `${item.title} ${item.description} ${item.stack.join(' ')}`.toLowerCase().includes(normalizedQuery))
        .map((item) => ({ title: item.title, detail: `Project · ${item.status}`, page: 'My Projects' })),
      ...lifeEvents.filter((item) => `${item.title} ${item.category} ${item.notes}`.toLowerCase().includes(normalizedQuery))
        .map((item) => ({ title: item.title, detail: `Milestone · ${item.category}`, page: 'Life Timeline' })),
    ].slice(0, 7);
  }, [query, courses, challenges, projects, lifeEvents]);

  function navigate(destination) {
    setPage(destination);
    setQuery('');
    setMobileMenu(false);
    setMobileSearchOpen(false);
    setShowNotifications(false);
    setActiveChallenge(null);
    setFeedback('');
    setSearchFocused(false);
  }

  function openSearchResult(result) {
    navigate(result.page);
    setQuery(result.title);
  }

  function exportProgress() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { courses, challenges, projects, tasks, activityDates, lifeEvents, profileName, theme },
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `mhrupath-progress-${getTodayKey()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setSettingsFeedback('Your progress backup has been downloaded.');
  }

  async function importProgress(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.size > 5 * 1024 * 1024) {
        setSettingsFeedback('This backup is too large. Choose a file under 5 MB.');
        return;
      }

      const backup = JSON.parse(await file.text());
      if (!isProgressBackup(backup)) {
        setSettingsFeedback('This file is not a valid MhruPath progress backup.');
        return;
      }

      const data = backup.data;
      setCourses(data.courses);
      setChallenges(data.challenges);
      setProjects(data.projects);
      setTasks(data.tasks);
      setActivityDates(data.activityDates);
      setLifeEvents(data.lifeEvents);
      setProfileName(data.profileName);
      setTheme(data.theme);
      setSettingsFeedback('Your backup has been restored.');
    } catch (error) {
      console.error('Unable to restore the MhruPath progress backup.', error);
      setSettingsFeedback('The backup could not be read. Choose a valid MhruPath JSON backup.');
    } finally {
      event.target.value = '';
    }
  }

  function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (task && !task.done) recordActivity();
    setTasks((previous) => previous.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function recordActivity() {
    const today = getTodayKey();
    setActivityDates((previous) => previous.includes(today) ? previous : [...previous, today]);
  }

  function completeLesson(courseId) {
    const course = courses.find((item) => item.id === courseId);
    if (!course || course.progress >= 100) return;
    recordActivity();
    setCourses((previous) => previous.map((course) => {
      if (course.id !== courseId || course.progress >= 100) return course;
      const nextProgress = Math.min(100, course.progress + 5);
      const done = Math.round(nextProgress / 5);
      return { ...course, progress: nextProgress, lessons: `${Math.min(20, done)}/20` };
    }));
  }

  function startChallenge(challenge) {
    setActiveChallenge(challenge);
    setSelectedAnswer('');
    setFeedback('');
  }

  function submitAnswer() {
    if (!selectedAnswer) {
      setFeedback('Choose an answer before submitting.');
      return;
    }

    const correct = selectedAnswer === activeChallenge.answer;
    if (correct && !activeChallenge.completed) {
      setChallenges((previous) => previous.map((item) =>
        item.id === activeChallenge.id ? { ...item, completed: true } : item
      ));
      recordActivity();
    }
    setFeedback(correct ? 'Correct! Great work. Your result has been saved.' : 'Not quite. Review the question and try again.');
  }

  function addTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    setTasks((previous) => [...previous, {
      id: Date.now(),
      title: newTask.trim(),
      detail: 'Personal goal',
      done: false,
    }]);
    setNewTask('');
  }

  function removeTask(id) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }

  function addProject(event) {
    event.preventDefault();
    const title = newProjectTitle.trim();
    if (!title) return;

    const colors = ['blue', 'green', 'purple', 'orange'];
    const stack = newProjectStack.split(',').map((item) => item.trim()).filter(Boolean);
    setProjects((previous) => [...previous, {
      id: Date.now(),
      title,
      description: newProjectDescription.trim() || 'A new project in your portfolio.',
      stack,
      status: 'Not started',
      progress: 0,
      icon: '✦',
      color: colors[projects.length % colors.length],
    }]);
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectStack('');
    setShowProjectForm(false);
  }

  function closeProjectForm() {
    setShowProjectForm(false);
    setNewProjectTitle('');
    setNewProjectDescription('');
    setNewProjectStack('');
  }

  function updateProjectStatus(project) {
    const next = project.status === 'Not started'
      ? 'In progress'
      : project.status === 'In progress'
        ? 'Completed'
        : 'Not started';

    setProjects((previous) => previous.map((item) =>
      item.id === project.id
        ? { ...item, status: next, progress: next === 'Completed' ? 100 : next === 'In progress' ? Math.max(item.progress, 10) : 0 }
        : item
    ));
    if (next === 'Completed') recordActivity();
  }

  function resetLifeEventForm() {
    setShowLifeEventForm(false);
    setEditingLifeEventId(null);
    setLifeEventTitle('');
    setLifeEventDate(getTodayKey());
    setLifeEventCategory('Personal');
    setLifeEventNotes('');
  }

  function editLifeEvent(item) {
    setEditingLifeEventId(item.id);
    setLifeEventTitle(item.title);
    setLifeEventDate(item.date);
    setLifeEventCategory(item.category);
    setLifeEventNotes(item.notes);
    setShowLifeEventForm(true);
  }

  function saveLifeEvent(event) {
    event.preventDefault();
    const title = lifeEventTitle.trim();
    if (!title) return;

    const entry = {
      title,
      date: lifeEventDate,
      category: lifeEventCategory,
      notes: lifeEventNotes.trim(),
    };

    if (editingLifeEventId !== null) {
      setLifeEvents((previous) => previous.map((item) =>
        item.id === editingLifeEventId ? { ...item, ...entry } : item
      ));
    } else {
      const id = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setLifeEvents((previous) => [...previous, { id, ...entry }]);
    }

    resetLifeEventForm();
  }

  function deleteLifeEvent(id) {
    if (!window.confirm('Delete this life milestone? This cannot be undone.')) return;
    setLifeEvents((previous) => previous.filter((item) => item.id !== id));
    if (editingLifeEventId === id) resetLifeEventForm();
  }

  function renderDashboard() {
    const nextCourse = courses
      .filter((course) => course.progress < 100)
      .sort((first, second) => second.progress - first.progress)[0];
    const focusTasks = [...tasks]
      .sort((first, second) => Number(first.done) - Number(second.done))
      .slice(0, 4);

    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-pill"><span className="status-dot" /> YOUR WORKSPACE</span>
            <h2>Your next step<br /><span>starts right here.</span></h2>
            <p>{nextCourse ? `Pick up ${nextCourse.name} and keep your learning momentum going.` : 'You have completed every learning path. Start a project and put your skills to work.'}</p>
            {nextCourse
              ? <button className="primary-button" onClick={() => completeLesson(nextCourse.id)}>Continue {nextCourse.name} <span>→</span></button>
              : <button className="primary-button" onClick={() => navigate('My Projects')}>Explore projects <span>→</span></button>}
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="resume-card">
              <span className="resume-label">UP NEXT</span>
              <span className={`resume-icon ${nextCourse?.color || 'blue'}`}>{nextCourse?.icon || '✓'}</span>
              <strong>{nextCourse?.name || 'Learning paths complete'}</strong>
              <span className="resume-meta">{nextCourse ? `${nextCourse.lessons} lessons · ${nextCourse.progress}% complete` : 'Ready for your next project'}</span>
              {nextCourse && <ProgressBar value={nextCourse.progress} color={nextCourse.color} />}
            </div>
          </div>
          <div className="banner-decoration" />
        </section>

        <div className="stats-grid">
          <StatCard icon="◫" label="Learning paths" value={courses.filter((c) => c.progress > 0 && c.progress < 100).length} note={`${courses.length} available`} color="blue" />
          <StatCard icon="✓" label="Lessons completed" value={completedLessons} note="Across all courses" color="green" />
          <StatCard icon="⌘" label="Challenges solved" value={completedChallenges} note={`${challenges.length} available`} color="purple" />
          <StatCard icon="✧" label="Points earned" value={earnedPoints} note="Keep earning more" color="orange" />
        </div>

        <WeeklyActivity activityDates={activityDates} todayKey={todayKey} />

        <section className="content-section">
          <SectionHeading eyebrow="KEEP MOVING FORWARD" title="Continue learning" description="Pick up where you left off." action="All learning paths" onAction={() => navigate('Learning Paths')} />
          <div className="course-grid">
            {courses.filter((course) => course.progress > 0 && course.progress < 100).slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} onContinue={() => completeLesson(course.id)} />
            ))}
          </div>
        </section>

        <div className="dashboard-lower">
          <section className="panel">
            <SectionHeading eyebrow="STAY ON TRACK" title="Today's focus" description={`${completedTasks} of ${tasks.length} tasks completed`} action="All tasks" onAction={() => navigate('My Progress')} />
            <div className="focus-progress"><ProgressBar value={tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0} /><span>{tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0}%</span></div>
            <div className="task-list">
              {focusTasks.map((task) => (
                <div className="task-row" key={task.id}>
                  <label className={`task-item ${task.done ? 'task-done' : ''}`}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                    <span className="custom-check">{task.done ? '✓' : ''}</span>
                    <span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                  </label>
                  <button className="task-remove" type="button" aria-label={`Remove ${task.title}`} title="Remove task" onClick={() => removeTask(task.id)}>×</button>
                </div>
              ))}
            </div>
            {!tasks.length && <p className="muted small-text">Add a small goal to get your day started.</p>}
            <form className="quick-task-form" onSubmit={addTask}>
              <input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a quick task..." aria-label="New focus task" maxLength={120} required />
              <button type="submit" aria-label="Add focus task">+</button>
            </form>
          </section>

          <section className="panel challenge-panel">
            <SectionHeading eyebrow="QUICK PRACTICE" title="Daily challenge" description="A little practice goes a long way." action="Explore" onAction={() => navigate('Challenges')} />
            {challenges.filter((item) => !item.completed).slice(0, 2).map((item) => (
              <button className="challenge-row" key={item.id} onClick={() => startChallenge(item)}>
                <span className="challenge-symbol">{'</>'}</span>
                <span className="challenge-copy"><strong>{item.title}</strong><small>{item.topic} · {item.difficulty}</small></span>
                <span className="points-label">+{item.points} pts</span>
              </button>
            ))}
            {completedChallenges === challenges.length && <p className="muted">You've solved every available challenge. Excellent work!</p>}
          </section>
        </div>

        <ProjectWorkspace projects={projects} onUpdate={updateProjectStatus} onViewAll={() => navigate('My Projects')} />
      </>
    );
  }

  function renderLearning() {
    const categories = ['All', ...new Set(courses.map((course) => course.category))];
    return (
      <section className="content-section page-section">
        <SectionHeading eyebrow="YOUR CURRICULUM" title="Learning paths" description="Learn one concept at a time, then apply it in practice." />
        <div className="filter-row">
          <div className="filter-chips">
            {categories.map((item) => <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <span className="muted small-text">{filteredCourses.length} paths</span>
        </div>
        {filteredCourses.length ? <div className="course-grid course-grid-wide">
          {filteredCourses.map((course) => <CourseCard key={course.id} course={course} onContinue={() => completeLesson(course.id)} />)}
        </div> : <EmptyState title="No learning paths found" detail="Try another search or category." />}
        <div className="tip-panel"><span>✦</span><div><strong>Learning tip</strong><p>Practice a little every day. Consistency helps you remember what you learn.</p></div></div>
      </section>
    );
  }

  function renderChallenges() {
    if (activeChallenge) {
      return (
        <section className="panel challenge-detail">
          <button className="text-button back-button" onClick={() => { setActiveChallenge(null); setFeedback(''); }}>← All challenges</button>
          <span className="eyebrow">{activeChallenge.topic} · {activeChallenge.difficulty}</span>
          <h2>{activeChallenge.title}</h2>
          <p>{activeChallenge.question}</p>
          <div className="answer-options">
            {activeChallenge.options.map((option) => (
              <button key={option} className={`answer-option ${selectedAnswer === option ? 'answer-selected' : ''}`} onClick={() => setSelectedAnswer(option)}>
                <span className="answer-radio">{selectedAnswer === option ? '●' : '○'}</span>{option}
              </button>
            ))}
          </div>
          {feedback && <p className={`feedback ${feedback.startsWith('Correct') ? 'feedback-success' : ''}`}>{feedback}</p>}
          <div className="challenge-footer"><span className="points-label">Reward: {activeChallenge.points} points</span><button className="primary-button" onClick={submitAnswer}>Check answer →</button></div>
        </section>
      );
    }

    return (
      <section className="content-section page-section">
        <SectionHeading eyebrow="PRACTICE MAKES PROGRESS" title="Coding challenges" description="Test your knowledge, solve problems, and build confidence." />
        <div className="challenge-summary panel"><div className="summary-icon">⌘</div><div><strong>{completedChallenges} of {challenges.length} solved</strong><p className="muted">You have earned {earnedPoints} points so far.</p><ProgressBar value={challenges.length ? completedChallenges / challenges.length * 100 : 0} /></div></div>
        <div className="challenge-list">
          {filteredChallenges.map((item) => (
            <article className="challenge-card" key={item.id}>
              <span className="challenge-symbol">{'</>'}</span>
              <div className="challenge-card-copy"><h3>{item.title}</h3><p className="muted">{item.topic} · {item.difficulty}</p></div>
              {item.completed && <span className="completed-label">✓ Solved</span>}
              <span className="points-label">{item.points} pts</span>
              <button className="secondary-button" onClick={() => startChallenge(item)}>{item.completed ? 'Practice again' : 'Solve challenge'} →</button>
            </article>
          ))}
          {!filteredChallenges.length && <EmptyState title="No challenges found" detail="Try a different search." />}
        </div>
      </section>
    );
  }

  function renderProjects() {
    return (
      <section className="content-section page-section">
        <SectionHeading eyebrow="BUILD YOUR PORTFOLIO" title="My projects" description="Apply your knowledge by building useful applications." action={showProjectForm ? 'Cancel' : 'New project'} onAction={() => showProjectForm ? closeProjectForm() : setShowProjectForm(true)} />
        {showProjectForm && (
          <form className="new-project-form panel" onSubmit={addProject}>
            <div className="new-project-form-heading"><span className="eyebrow">START SOMETHING NEW</span><h3>Create a project</h3></div>
            <label>
              <span>Project name</span>
              <input autoFocus required maxLength={70} value={newProjectTitle} onChange={(event) => setNewProjectTitle(event.target.value)} placeholder="e.g. Habit tracker" />
            </label>
            <label>
              <span>What are you building?</span>
              <input maxLength={160} value={newProjectDescription} onChange={(event) => setNewProjectDescription(event.target.value)} placeholder="A short description of your idea" />
            </label>
            <label>
              <span>Tech stack <small>Separate with commas</small></span>
              <input maxLength={100} value={newProjectStack} onChange={(event) => setNewProjectStack(event.target.value)} placeholder="React, Node.js, CSS" />
            </label>
            <div className="new-project-form-actions">
              <button className="secondary-button" type="button" onClick={closeProjectForm}>Cancel</button>
              <button className="primary-button" type="submit">Create project <span>→</span></button>
            </div>
          </form>
        )}
        <div className="project-grid project-grid-wide">
          {filteredProjects.map((project) => <ProjectCard key={project.id} project={project} onUpdate={() => updateProjectStatus(project)} />)}
        </div>
        {!filteredProjects.length && <EmptyState title="No projects found" detail="Try a different search." />}
        <p className="muted small-text">Project statuses are saved in your browser. These are starter projects; GitHub integration can be added later.</p>
      </section>
    );
  }

  function renderProgress() {
    return (
      <section className="content-section page-section">
        <SectionHeading eyebrow="YOUR JOURNEY" title="My progress" description="Every lesson and practice session moves you forward." />
        <div className="stats-grid">
          <StatCard icon="◫" label="Learning progress" value={`${averageProgress}%`} note="Average course completion" color="blue" />
          <StatCard icon="✓" label="Lessons completed" value={completedLessons} note="Across all learning paths" color="green" />
          <StatCard icon="⌘" label="Challenges solved" value={completedChallenges} note="Keep practicing" color="purple" />
          <StatCard icon="✧" label="Points earned" value={earnedPoints} note="From completed challenges" color="orange" />
        </div>
        <section className="panel progress-panel">
          <h3>Course completion</h3>
          {courses.map((course) => <div className="progress-course" key={course.id}><div className="progress-course-heading"><span>{course.icon} &nbsp;{course.name}</span><strong>{course.progress}%</strong></div><ProgressBar value={course.progress} color={course.color} /></div>)}
        </section>
        <section className="panel">
          <SectionHeading title="Your daily focus" description="Keep your tasks manageable and celebrate your progress." />
          <form className="add-task-form" onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a learning goal..." aria-label="New learning goal" maxLength={120} required /><button className="primary-button" type="submit">+ Add task</button></form>
          <div className="task-list">
            {tasks.map((task) => <div className="task-row" key={task.id}><label className={`task-item ${task.done ? 'task-done' : ''}`}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span className="custom-check">{task.done ? '✓' : ''}</span><span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span></label><button className="task-remove" type="button" aria-label={`Remove ${task.title}`} title="Remove task" onClick={() => removeTask(task.id)}>×</button></div>)}
          </div>
        </section>
      </section>
    );
  }

  function renderLifeTimeline() {
    const sortedEvents = [...filteredLifeEvents].sort((first, second) =>
      second.date.localeCompare(first.date)
    );

    return (
      <section className="content-section page-section">
        <SectionHeading
          eyebrow="YOUR LIFE, YOUR STORY"
          title="A life worth remembering"
          description="Record the moments, changes, and milestones that shape your life."
          action={showLifeEventForm ? 'Cancel' : 'Record a milestone'}
          onAction={() => showLifeEventForm ? resetLifeEventForm() : setShowLifeEventForm(true)}
        />
        <div className="life-timeline-summary panel">
          <span className="life-timeline-icon" aria-hidden="true">◷</span>
          <div>
            <strong>{lifeEvents.length} {lifeEvents.length === 1 ? 'moment' : 'moments'} recorded</strong>
            <p className="muted">Your timeline is saved privately in this browser.</p>
          </div>
        </div>

        {showLifeEventForm && (
          <form className="life-event-form panel" onSubmit={saveLifeEvent}>
            <div className="life-event-form-heading">
              <span className="eyebrow">{editingLifeEventId !== null ? 'UPDATE YOUR STORY' : 'SAVE THIS MOMENT'}</span>
              <h3>{editingLifeEventId !== null ? 'Edit milestone' : 'Record a milestone'}</h3>
            </div>
            <label>
              <span>What happened?</span>
              <input autoFocus required maxLength={100} value={lifeEventTitle} onChange={(event) => setLifeEventTitle(event.target.value)} placeholder="e.g. Moved to a new city" />
            </label>
            <label>
              <span>When?</span>
              <input required type="date" value={lifeEventDate} onChange={(event) => setLifeEventDate(event.target.value)} />
            </label>
            <label>
              <span>Category</span>
              <select value={lifeEventCategory} onChange={(event) => setLifeEventCategory(event.target.value)}>
                <option>Personal</option>
                <option>Family & relationships</option>
                <option>Education</option>
                <option>Work</option>
                <option>Health</option>
                <option>Travel</option>
                <option>Other</option>
              </select>
            </label>
            <label className="life-event-notes-field">
              <span>Details <small>Optional</small></span>
              <textarea maxLength={1000} value={lifeEventNotes} onChange={(event) => setLifeEventNotes(event.target.value)} placeholder="Add a few details to remember this moment..." rows="4" />
            </label>
            <div className="life-event-form-actions">
              <button className="secondary-button" type="button" onClick={resetLifeEventForm}>Cancel</button>
              <button className="primary-button" type="submit">{editingLifeEventId !== null ? 'Save changes' : 'Save milestone'} <span>→</span></button>
            </div>
          </form>
        )}

        <div className="life-timeline">
          {sortedEvents.map((item) => (
            <article className="life-event-card panel" key={item.id}>
              <div className="life-event-marker" aria-hidden="true"><span /></div>
              <div className="life-event-content">
                <div className="life-event-meta">
                  <time dateTime={item.date}>{formatLifeEventDate(item.date)}</time>
                  <span className="life-event-category">{item.category}</span>
                </div>
                <h3>{item.title}</h3>
                {item.notes && <p className="life-event-notes">{item.notes}</p>}
              </div>
              <div className="life-event-actions">
                <button className="text-button" type="button" onClick={() => editLifeEvent(item)}>Edit</button>
                <button className="text-button life-event-delete" type="button" onClick={() => deleteLifeEvent(item.id)}>Delete</button>
              </div>
            </article>
          ))}
          {!sortedEvents.length && (
            <EmptyState
              title={query ? 'No matching moments' : 'Your story starts here'}
              detail={query ? 'Try another search.' : 'Add a milestone, memory, or turning point to begin your timeline.'}
            />
          )}
        </div>
        <p className="muted small-text life-timeline-privacy">Only milestones you choose to add are recorded. Your entries stay in this browser and are not sent to a server.</p>
      </section>
    );
  }

  function renderLeaderboard() {
    const people = [
      { name: profileName, points: earnedPoints, you: true },
      { name: 'Alex Morgan', points: 420, you: false },
      { name: 'Sam Taylor', points: 350, you: false },
      { name: 'Jordan Lee', points: 280, you: false },
      { name: 'Taylor Kim', points: 190, you: false },
    ].sort((a, b) => b.points - a.points);

    return <section className="content-section page-section"><SectionHeading eyebrow="CELEBRATE GROWTH" title="Leaderboard" description="A sample ranking to demonstrate the leaderboard layout." /><div className="panel leaderboard-list">{people.map((person, index) => <div className={`leaderboard-row ${person.you ? 'you-row' : ''}`} key={person.name}><span className="rank-number">{index + 1}</span><span className="avatar">{person.name.slice(0, 1).toUpperCase()}</span><span className="leader-name">{person.name}{person.you && <small>YOU</small>}</span><strong>{person.points} pts</strong></div>)}</div><p className="muted small-text">Other users are demonstration data. A real shared leaderboard requires a backend.</p></section>;
  }

  function renderCommunity() {
    return <section className="content-section page-section"><SectionHeading eyebrow="LEARN TOGETHER" title="Community" description="Ideas for learning with other developers." /><div className="community-grid"><CommunityCard icon="⌘" title="Share your code" detail="Practice explaining your code and asking focused questions." /><CommunityCard icon="◈" title="Build together" detail="Find a partner to review projects and exchange feedback." /><CommunityCard icon="✦" title="Celebrate progress" detail="Share milestones and help other learners stay motivated." /></div><div className="tip-panel"><span>◎</span><div><strong>Community preview</strong><p>Live chat, shared posts, and user accounts will require a backend and database.</p></div></div></section>;
  }

  function renderSettings() {
    return (
      <section className="content-section page-section">
        <SectionHeading eyebrow="MAKE IT YOURS" title="Settings" description="Personalize your learning workspace." />
        <div className="panel settings-panel">
          <label className="settings-field">
            <span><strong>Display name</strong><small>This name appears in your dashboard and sample leaderboard.</small></span>
            <input maxLength={40} value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" />
          </label>
          <div className="settings-field">
            <span><strong>Appearance</strong><small>Choose a comfortable interface theme.</small></span>
            <button type="button" className="secondary-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}</button>
          </div>
          <div className="settings-field">
            <span><strong>Local progress</strong><small>Your learning progress and preferences are stored in this browser.</small></span>
            <span className="completed-label">Enabled</span>
          </div>
          <div className="settings-field">
            <span><strong>Backup & restore</strong><small>Download a private copy of your progress or restore it on this device.</small></span>
            <div className="settings-actions">
              <button type="button" className="secondary-button" onClick={exportProgress}>Download backup</button>
              <button type="button" className="secondary-button" onClick={() => backupInputRef.current?.click()}>Restore backup</button>
              <input ref={backupInputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={importProgress} aria-label="Choose a MhruPath backup file" />
            </div>
          </div>
          {settingsFeedback && <p className="settings-feedback" role="status">{settingsFeedback}</p>}
          <div className="settings-field">
            <span><strong>Reset demo data</strong><small>Restore starter courses, challenges, projects, and tasks.</small></span>
            <button type="button" className="danger-button" onClick={() => { if (window.confirm('Reset all MhruPath demo progress?')) { setCourses(initialCourses); setChallenges(initialChallenges); setProjects(initialProjects); setTasks(initialTasks); setActivityDates([]); setSettingsFeedback('Demo progress has been reset.'); } }}>Reset progress</button>
          </div>
        </div>
      </section>
    );
  }

  const pageDescriptions = {
    'Dashboard': 'Your learning workspace at a glance.',
    'Learning Paths': 'Explore courses and build your skills.',
    'Challenges': 'Practice your coding knowledge.',
    'My Projects': 'Turn ideas into working applications.',
    'My Progress': 'Track your learning journey.',
    'Life Timeline': 'Record and revisit the moments that shape your life.',
    'Leaderboard': 'Celebrate learning achievements.',
    'Community': 'Learn and grow together.',
    'Settings': 'Customize your workspace.',
  };

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <button className="brand" onClick={() => navigate('Dashboard')} aria-label="MhruPath home"><span className="brand-mark">M<span>.</span></span><span className="brand-copy">Mhru<span>Path</span><small>YOUR DEVELOPER JOURNEY</small></span></button>
        <div className="sidebar-divider" />
        <div className="sidebar-profile"><div className="avatar profile-avatar">{profileName.slice(0, 1).toUpperCase() || 'D'}</div><div><strong>{profileName || 'Developer'}</strong><small>Future Software Engineer</small></div><span className="profile-status" /></div>
        <nav id="primary-navigation" className="sidebar-nav" aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.id}</span>{item.id === 'Challenges' && <span className="nav-count">{challenges.length - completedChallenges}</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="daily-goal"><div className="goal-icon">✦</div><strong>Small steps, big goals.</strong><p>Every line of code is progress.</p><ProgressBar value={tasks.length ? completedTasks / tasks.length * 100 : 0} /><small>{completedTasks}/{tasks.length} daily tasks done</small></div><button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => navigate('Settings')}><span className="nav-icon">⚙</span>Settings</button><div className="sidebar-version">MHRUPATH · LEARN BY BUILDING</div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu-button" aria-expanded={mobileMenu} aria-controls="primary-navigation" onClick={() => setMobileMenu(!mobileMenu)} aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'}>☰</button><div><div className="breadcrumb">Workspace <span>/</span> {page}</div><p className="topbar-subtitle">{pageDescriptions[page]}</p></div></div>
          <div className="topbar-actions">
            <div className={`search-wrap ${mobileSearchOpen ? 'search-mobile-open' : ''}`}>
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search your workspace..."
                  aria-label="Search learning paths, challenges, projects, and milestones"
                  aria-haspopup="listbox"
                  aria-expanded={searchFocused && Boolean(query.trim())}
                />
                <kbd>Ctrl K</kbd>
              </label>
              {searchFocused && query.trim() && (
                <div className="search-results" role="listbox" aria-label="Search results">
                  {globalSearchResults.length ? globalSearchResults.map((result) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected="false"
                      className="search-result"
                      key={`${result.page}-${result.title}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openSearchResult(result)}
                    >
                      <span className="search-result-icon" aria-hidden="true">⌕</span>
                      <span><strong>{result.title}</strong><small>{result.detail}</small></span>
                      <span className="search-result-arrow" aria-hidden="true">→</span>
                    </button>
                  )) : <p className="search-empty">No matches in your workspace.</p>}
                </div>
              )}
            </div>
            <button type="button" className="icon-button mobile-search-button" aria-label={mobileSearchOpen ? 'Close search' : 'Open search'} aria-expanded={mobileSearchOpen} onClick={() => { setMobileSearchOpen(!mobileSearchOpen); if (!mobileSearchOpen) window.setTimeout(() => searchInputRef.current?.focus(), 0); }}>⌕</button>
            <button className="icon-button" aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☼' : '☾'}</button>
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Learning reminders" aria-expanded={showNotifications} onClick={() => setShowNotifications(!showNotifications)}>♧</button>{showNotifications && <div className="notification-popover"><strong>{pendingTasks ? 'Your daily focus' : availableChallenges ? 'Ready for a quick practice?' : 'You’re all caught up!'}</strong><p className="muted">{pendingTasks ? `${pendingTasks} task${pendingTasks === 1 ? '' : 's'} left in your daily focus.` : availableChallenges ? `${availableChallenges} coding challenge${availableChallenges === 1 ? '' : 's'} ready when you are.` : 'You have completed your current learning goals.'}</p><button className="text-button" onClick={() => { const destination = pendingTasks ? 'My Progress' : availableChallenges ? 'Challenges' : 'Dashboard'; setShowNotifications(false); navigate(destination); }}>{pendingTasks ? 'Review daily focus →' : availableChallenges ? 'Practice now →' : 'Back to dashboard →'}</button></div>}</div>
            <button className="top-avatar" onClick={() => navigate('Settings')} title="Profile settings">{profileName.slice(0, 1).toUpperCase() || 'D'}</button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-title-row"><div><p className="eyebrow">{page === 'Dashboard' ? todayDisplay.toUpperCase() : 'YOUR DEVELOPER JOURNEY'}</p><h1>{page === 'Dashboard' ? <>Good day, <span>{profileName || 'Developer'}</span> <span className="wave">✦</span></> : page}</h1><p className="muted">{pageDescriptions[page]}</p></div><div className="date-chip">◷ &nbsp; {todayDisplay}</div></div>

          {page === 'Dashboard' && renderDashboard()}
          {page === 'Learning Paths' && renderLearning()}
          {page === 'Challenges' && renderChallenges()}
          {page === 'My Projects' && renderProjects()}
          {page === 'My Progress' && renderProgress()}
          {page === 'Life Timeline' && renderLifeTimeline()}
          {page === 'Leaderboard' && renderLeaderboard()}
          {page === 'Community' && renderCommunity()}
          {page === 'Settings' && renderSettings()}

          <footer className="app-footer"><span><span className="footer-brand">M.</span> MhruPath</span><span>Learn with purpose. Build with confidence.</span><span>Progress saved locally</span></footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, note, color }) {
  return <article className="stat-card"><div className={`stat-icon ${color}`}>{icon}</div><p className="stat-label">{label}</p><div className="stat-value">{value}</div><p className="stat-note"><span>↗</span> {note}</p></article>;
}

function ProjectWorkspace({ projects, onUpdate, onViewAll }) {
  const activeCount = projects.filter((project) => project.status === 'In progress').length;
  const completedCount = projects.filter((project) => project.status === 'Completed').length;
  const averageProgress = projects.length
    ? Math.round(projects.reduce((total, project) => total + project.progress, 0) / projects.length)
    : 0;

  return (
    <section className="project-workspace content-section">
      <SectionHeading
        eyebrow="BUILD & SHIP"
        title="Project pipeline"
        description="A clear view of what you're building and what comes next."
        action="Manage projects"
        onAction={onViewAll}
      />
      <div className="pipeline-summary">
        <div><span className="pipeline-stat-label">Total projects</span><strong>{projects.length}</strong></div>
        <div><span className="pipeline-stat-label">In progress</span><strong>{activeCount}</strong></div>
        <div><span className="pipeline-stat-label">Completed</span><strong>{completedCount}</strong></div>
        <div className="pipeline-progress"><span className="pipeline-stat-label">Portfolio progress</span><strong>{averageProgress}%</strong><ProgressBar value={averageProgress} /></div>
      </div>
      {projects.length ? (
        <div className="pipeline-list">
          {projects.slice(0, 4).map((project) => (
            <article className="pipeline-row" key={project.id}>
              <span className={`pipeline-project-icon ${project.color}`}>{project.icon}</span>
              <div className="pipeline-project-info">
                <strong>{project.title}</strong>
                <span>{project.stack.length ? project.stack.join(' · ') : 'Add a tech stack'}</span>
              </div>
              <div className="pipeline-project-progress">
                <div><span>{project.status}</span><strong>{project.progress}%</strong></div>
                <ProgressBar value={project.progress} color={project.color} />
              </div>
              <button className="pipeline-action" onClick={() => onUpdate(project)}>
                {project.status === 'Not started' ? 'Start' : project.status === 'In progress' ? 'Complete' : 'Restart'}
                <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="pipeline-empty">
          <strong>Your project pipeline is ready.</strong>
          <p className="muted">Create a project to start turning what you learn into something real.</p>
          <button className="text-button" onClick={onViewAll}>Create your first project →</button>
        </div>
      )}
    </section>
  );
}

function WeeklyActivity({ activityDates, todayKey }) {
  const week = getWeekDatesForKey(todayKey);
  const activeDates = new Set(activityDates);
  const activeDays = week.filter((day) => activeDates.has(day.key)).length;
  const streak = getActivityStreak(activityDates, todayKey);

  return (
    <section className="weekly-activity" aria-label="Weekly learning activity">
      <div className="weekly-activity-copy">
        <span className="weekly-activity-icon" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">YOUR MOMENTUM</p>
          <h2>{streak} day{streak === 1 ? '' : 's'} in a row</h2>
          <p className="muted">{activeDays} of 7 days active this week</p>
        </div>
      </div>
      <div className="week-activity" aria-label={`${activeDays} active days this week`}>
        {week.map((day) => {
          const isToday = day.key === todayKey;
          const isActive = activeDates.has(day.key);
          return (
            <div className={`week-day ${isActive ? 'week-day-active' : ''} ${isToday ? 'week-day-today' : ''}`} key={day.key}>
              <span>{day.label}</span>
              <span className="week-day-mark" aria-label={isActive ? 'Activity recorded' : 'No activity'}>
                {isActive ? '✓' : ''}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CourseCard({ course, onContinue }) {
  return <article className="course-card"><div className="course-card-top"><span className={`course-icon ${course.color}`}>{course.icon}</span><span className={`level-badge ${course.level === 'Beginner' ? 'easy' : 'medium'}`}>{course.level}</span></div><p className="course-category">{course.category}</p><h3>{course.name}</h3><p className="course-meta">{course.lessons} lessons completed</p><div className="course-progress-label"><span>Progress</span><strong>{course.progress}%</strong></div><ProgressBar value={course.progress} color={course.color} /><button className="course-action" onClick={onContinue}>{course.progress === 100 ? 'Completed ✓' : course.progress === 0 ? 'Start learning' : 'Continue learning'} <span>→</span></button></article>;
}

function ProjectCard({ project, onUpdate }) {
  return <article className="project-card"><div className={`project-visual ${project.color}`}><span>{project.icon}</span><span className="project-visual-dots">✦ · ·</span></div><div className="project-card-body"><div className="project-heading"><h3>{project.title}</h3><span className={`project-status ${project.status === 'Completed' ? 'status-complete' : ''}`}>{project.status}</span></div><p>{project.description}</p><div className="tech-tags">{project.stack.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-progress-heading"><span>Progress</span><strong>{project.progress}%</strong></div><ProgressBar value={project.progress} color={project.color} /><button className="course-action" onClick={onUpdate}>{project.status === 'Not started' ? 'Start project' : project.status === 'In progress' ? 'Mark completed' : 'Restart project'} <span>→</span></button></div></article>;
}

function CommunityCard({ icon, title, detail }) {
  return <article className="panel community-card"><span className="community-icon">{icon}</span><h3>{title}</h3><p className="muted">{detail}</p></article>;
}

function EmptyState({ title, detail }) {
  return <div className="empty-state"><span>⌕</span><h3>{title}</h3><p>{detail}</p></div>;
}

export default App;
