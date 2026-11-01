# FocusFlow — Advanced Internet Programming Mini Project

A responsive, full-stack task planner built with browser HTML/CSS/JavaScript and a Node.js REST API. Tasks are stored in a local JSON file, so your list survives a server restart.

## Requirements

- Node.js 18 or newer
- No external packages are required

## Run the project

Double-click `RUN-FOCUSFLOW.bat` in this folder to start the server and open the app. Or open a terminal in this project folder and run:

```sh
npm start
```

Then visit **http://localhost:3000**. Stop the server with `Ctrl+C`.

## Features

- Create tasks with category, priority, notes, and optional due date
- Mark tasks complete or active, and delete them
- Search by title, note, or category; filter by view and status
- Sort by creation time, due date, or priority
- Today, upcoming, completed, and category views
- Summary cards and a weekly progress indicator
- Responsive layout and saved light/dark theme preference
- REST endpoints with input validation and JSON persistence

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update task fields or completion |
| DELETE | `/api/tasks/:id` | Delete a task |

Task data is written to `data/tasks.json`, created automatically the first time the server runs.

## Project structure

```text
index.html       Page structure
styles.css       Responsive styling and dark theme
visual-refresh.css Additional visual polish, accent colours, and subtle motion
effects.css      Task entrance effects, category icons, and completion celebration
category-icons.css Professional outline icons for Work, Study, and Personal
app.js           Browser interface and API integration
server.js        Node.js HTTP server and REST API
data/tasks.json  Persistent task data (created at runtime)
```
