
import { useEffect, useMemo, useState } from 'react';
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

const navGroups = [
  { label: 'WORKSPACE', items: [{ id: 'Dashboard', icon: '▦' }, { id: 'Learning Paths', icon: '◫' }, { id: 'Challenges', icon: '⌘' }, { id: 'My Projects', icon: '▣' }] },
  { label: 'YOUR JOURNEY', items: [{ id: 'My Progress', icon: '▥' }, { id: 'Leaderboard', icon: '♜' }, { id: 'Community', icon: '◎' }] },
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
  const [theme, setTheme] = useState(() => readSaved('theme', 'dark'));
  const [courses, setCourses] = useState(() => readSaved('courses', initialCourses));
  const [challenges, setChallenges] = useState(() => readSaved('challenges', initialChallenges));
  const [projects, setProjects] = useState(() => readSaved('projects', initialProjects));
  const [tasks, setTasks] = useState(() => readSaved('tasks', initialTasks));
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileName, setProfileName] = useState(() => readSaved('name', 'Developer'));
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveValue('theme', theme);
  }, [theme]);

  useEffect(() => saveValue('courses', courses), [courses]);
  useEffect(() => saveValue('challenges', challenges), [challenges]);
  useEffect(() => saveValue('projects', projects), [projects]);
  useEffect(() => saveValue('tasks', tasks), [tasks]);
  useEffect(() => saveValue('name', profileName), [profileName]);

  const completedChallenges = challenges.filter((item) => item.completed).length;
  const completedTasks = tasks.filter((task) => task.done).length;
  const averageProgress = Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length);
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

  function navigate(destination) {
    setPage(destination);
    setQuery('');
    setMobileMenu(false);
    setShowNotifications(false);
    setActiveChallenge(null);
    setFeedback('');
  }

  function toggleTask(id) {
    setTasks((previous) => previous.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  }

  function completeLesson(courseId) {
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
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-pill"><span className="status-dot" /> YOUR LEARNING JOURNEY</span>
            <h2>Build your future,<br /><span>one line at a time.</span></h2>
            <p>Every expert was once a beginner. Keep learning, keep building, and make today count.</p>
            <button className="primary-button" onClick={() => navigate('Learning Paths')}>Continue learning <span>→</span></button>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-code">
              <span className="code-dots">● ● ●</span>
              <p><span>const</span> future = {'{'}</p>
              <p className="code-indent">skills: <b>'growing'</b>,</p>
              <p className="code-indent">success: <b>true</b>,</p>
              <p className="code-indent">keepGoing: <b>true</b></p>
              <p>{'}'};</p>
              <p className="code-success">✓ Ready to build</p>
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
            <SectionHeading title="Today's focus" description={`${completedTasks} of ${tasks.length} tasks completed`} action="View all" onAction={() => navigate('My Progress')} />
            <ProgressBar value={tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0} />
            <div className="task-list">
              {tasks.slice(0, 4).map((task) => (
                <label className={`task-item ${task.done ? 'task-done' : ''}`} key={task.id}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                  <span className="custom-check">{task.done ? '✓' : ''}</span>
                  <span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span>
                </label>
              ))}
            </div>
          </section>

          <section className="panel challenge-panel">
            <SectionHeading title="Daily challenge" description="A little practice goes a long way." action="Explore" onAction={() => navigate('Challenges')} />
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

        <section className="content-section">
          <SectionHeading eyebrow="LEARN BY DOING" title="Your projects" description="Turn what you learn into something real." action="All projects" onAction={() => navigate('My Projects')} />
          <div className="project-grid">
            {projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} onUpdate={() => updateProjectStatus(project)} />)}
          </div>
        </section>
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
        <SectionHeading eyebrow="BUILD YOUR PORTFOLIO" title="My projects" description="Apply your knowledge by building useful applications." />
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
          <form className="add-task-form" onSubmit={addTask}><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add a learning goal..." aria-label="New learning goal" /><button className="primary-button" type="submit">+ Add task</button></form>
          <div className="task-list">
            {tasks.map((task) => <label className={`task-item ${task.done ? 'task-done' : ''}`} key={task.id}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} /><span className="custom-check">{task.done ? '✓' : ''}</span><span className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></span></label>)}
          </div>
        </section>
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
    return <section className="content-section page-section"><SectionHeading eyebrow="MAKE IT YOURS" title="Settings" description="Personalize your learning workspace." /><div className="panel settings-panel"><label className="settings-field"><span><strong>Display name</strong><small>This name appears in your dashboard and sample leaderboard.</small></span><input value={profileName} onChange={(event) => setProfileName(event.target.value)} placeholder="Your name" /></label><div className="settings-field"><span><strong>Appearance</strong><small>Choose a comfortable interface theme.</small></span><button className="secondary-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}</button></div><div className="settings-field"><span><strong>Local progress</strong><small>Your learning progress and preferences are stored in this browser.</small></span><span className="completed-label">Enabled</span></div><div className="settings-field"><span><strong>Reset demo data</strong><small>Restore starter courses, challenges, projects, and tasks.</small></span><button className="danger-button" onClick={() => { if (window.confirm('Reset all MhruPath demo progress?')) { setCourses(initialCourses); setChallenges(initialChallenges); setProjects(initialProjects); setTasks(initialTasks); } }}>Reset progress</button></div></div></section>;
  }

  const pageDescriptions = {
    'Dashboard': 'Your learning workspace at a glance.',
    'Learning Paths': 'Explore courses and build your skills.',
    'Challenges': 'Practice your coding knowledge.',
    'My Projects': 'Turn ideas into working applications.',
    'My Progress': 'Track your learning journey.',
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
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navGroups.map((group) => <div className="nav-group" key={group.label}><p className="nav-label">{group.label}</p>{group.items.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.id}</span>{item.id === 'Challenges' && <span className="nav-count">{challenges.length - completedChallenges}</span>}</button>)}</div>)}
        </nav>
        <div className="sidebar-bottom"><div className="daily-goal"><div className="goal-icon">✦</div><strong>Small steps, big goals.</strong><p>Every line of code is progress.</p><ProgressBar value={tasks.length ? completedTasks / tasks.length * 100 : 0} /><small>{completedTasks}/{tasks.length} daily tasks done</small></div><button className={`nav-item ${page === 'Settings' ? 'active' : ''}`} onClick={() => navigate('Settings')}><span className="nav-icon">⚙</span>Settings</button><div className="sidebar-version">MHRUPATH · LEARN BY BUILDING</div></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">☰</button><div><div className="breadcrumb">Workspace <span>/</span> {page}</div><p className="topbar-subtitle">{pageDescriptions[page]}</p></div></div>
          <div className="topbar-actions">
            <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anything..." aria-label="Search" /><kbd>⌕</kbd></label>
            <button className="icon-button" aria-label="Toggle theme" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☼' : '☾'}</button>
            <div className="notification-wrap"><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}>♧<span className="notification-dot" /></button>{showNotifications && <div className="notification-popover"><strong>You're all caught up!</strong><p className="muted">Keep going with your next lesson or coding challenge.</p><button className="text-button" onClick={() => { setShowNotifications(false); navigate('Challenges'); }}>Practice now →</button></div>}</div>
            <button className="top-avatar" onClick={() => navigate('Settings')} title="Profile settings">{profileName.slice(0, 1).toUpperCase() || 'D'}</button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-title-row"><div><p className="eyebrow">MONDAY · YOUR NEXT CHAPTER STARTS HERE</p><h1>{page === 'Dashboard' ? <>Good day, <span>{profileName || 'Developer'}</span> <span className="wave">✦</span></> : page}</h1><p className="muted">{pageDescriptions[page]}</p></div><div className="date-chip">◷ &nbsp; Keep learning today</div></div>

          {page === 'Dashboard' && renderDashboard()}
          {page === 'Learning Paths' && renderLearning()}
          {page === 'Challenges' && renderChallenges()}
          {page === 'My Projects' && renderProjects()}
          {page === 'My Progress' && renderProgress()}
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
