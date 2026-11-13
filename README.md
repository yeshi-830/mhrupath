# MhruPath

MhruPath is a browser-based learning workspace for people building software development skills. It brings learning paths, coding practice, project tracking, and personal progress into one responsive dashboard.

## Problem and solution

Self-directed learners often spread their goals across course trackers, notes, and project lists. MhruPath gives those activities a single place to track. The current application is intentionally single-user and saves progress in the browser, so it can be used without an account or database setup.

## Features

- Dashboard with learning summaries, weekly activity, daily tasks, and project status.
- Six editable learning paths with category filters and lesson progress.
- Built-in multiple-choice coding challenges with saved completion and points.
- Project list with create, search, and status progression.
- Daily learning goals that can be completed or removed, and a personal milestone timeline.
- Progress view, a clearly labeled sample leaderboard, and community guidance.
- Light and dark themes, responsive navigation, and workspace-wide search across paths, challenges, projects, and milestones.
- JSON progress backup and restore, with validation before imported data is applied.

The leaderboard entries are sample data. Community content is informational; MhruPath does not currently provide accounts, shared posts, or live chat.

## Technology

- React 19 and Vite 8 for the frontend.
- Express 5 for the small backend API.
- Browser `localStorage` for learning data and preferences.
- `mysql2` is present as a backend dependency, but no MySQL connection or database-backed feature is currently implemented.

## Architecture

The frontend is a React single-page application. It reads and writes progress locally using namespaced `mhrupath-*` local-storage keys. The Express backend provides a root status response and an API health endpoint; the frontend does not currently depend on the backend for its learning features.

```text
MhruPath/
├── backend/
│   ├── server.js          # Express status and health routes
│   ├── test/
│   │   └── server.test.js # API route, CORS, and request validation tests
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/            # Static icons
│   ├── src/
│   │   ├── App.jsx        # App state, views, and interactions
│   │   ├── App.css        # Component and responsive styles
│   │   ├── index.css      # Theme tokens and global styles
│   │   └── main.jsx       # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Requirements

- Node.js compatible with Vite 8 (Node.js 20.19+ or 22.12+).
- npm.

No database is required. The checked-in lockfiles should be used for reproducible dependency installation.

## Setup and run

Install each application's dependencies from its own folder:

```bash
cd frontend
npm ci
npm run dev
```

In another terminal, start the API:

```bash
cd backend
npm ci
npm run dev
```

The Vite development server prints its local URL (normally `http://localhost:5173`). The API listens on port `5000` by default. Use `npm start` in `backend` for the non-watch server process.

## Configuration

The backend loads environment variables with `dotenv`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port for the Express API. |
| `NODE_ENV` | unset | Set to `production` to disable the built-in Vite localhost CORS origins. |
| `CORS_ORIGINS` | empty | Comma-separated exact origins allowed to call the API; configure this for a deployed frontend. |

The frontend currently has no environment variables. Its progress is stored in the browser profile and is not synchronized between browsers or devices. Do not store sensitive data in this local-only application.

## API overview

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/` | JSON message confirming the API process is running. |
| `GET` | `/api/health` | JSON health status and `persistence: "browser-local"`. |

Unknown paths return JSON `404` errors. The API currently has no user, course, project, or database endpoints.

## Checks

From `frontend/`:

```bash
npm run lint
npm run build
npm run preview
```

From `backend/`:

```bash
npm test
npm start
```

The API test suite uses Node's built-in test runner. Then open `http://localhost:5000/api/health` to check the running API.

## Screenshots

No screenshots are included yet. Add current desktop and mobile screenshots here when available.

## Future improvements

- Add automated tests for learning flows, import validation, and API responses.
- Add an authenticated, persistent data model if cross-device progress is needed.
- Connect community and leaderboard views to real shared data before presenting them as live features.
- Add an API integration only when backend-backed functionality is introduced.
