# TaskFlow – Task Manager

A modern, responsive task manager web application built with pure HTML, CSS, and JavaScript as part of COMP120 Assignment 3.

---

## Overview

TaskFlow is a clean, dashboard-style task manager that runs entirely in the browser. Tasks are persisted in `localStorage` so they survive page refreshes — no backend or build step required.

---

## Features

| Feature | Details |
|---|---|
| ✅ Add tasks | Title (required), optional notes, priority, and due date |
| ✏️ Edit tasks | Update any field via a polished modal dialog |
| 🗑️ Delete tasks | Confirmation modal prevents accidental deletion |
| ☑️ Complete tasks | Checkbox toggle with visual strikethrough |
| 🎯 Priority levels | Low · Medium · High — colour-coded left border and badge |
| 📅 Due dates | Overdue tasks are highlighted in red |
| 🔍 Search | Live keyword search across title and notes |
| 🔖 Filters | All · Pending · Completed · High Priority |
| 📊 Statistics | Counts for Total, Pending, Completed, and High-Priority tasks |
| 💾 localStorage | Tasks persist across browser sessions automatically |
| 📱 Responsive | Mobile-first layout, works on all screen sizes |

---

## Technologies Used

- **HTML5** – semantic markup, ARIA accessibility attributes
- **CSS3** – custom properties (CSS variables), CSS Grid, Flexbox, animations
- **JavaScript (ES6+)** – DOM manipulation, localStorage API, event delegation
- **Google Fonts** – Inter typeface

No external frameworks, libraries, or build tools are needed.

---

## How to Run

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser.

```bash
git clone https://github.com/ISeckAli/comp120_ivanseckali_assignment3.git
cd comp120_ivanseckali_assignment3
# Then open index.html in your browser
```

That's it — no `npm install`, no server, no build step.

---

## Project Structure

```
comp120_ivanseckali_assignment3/
├── index.html   # Application markup and modal templates
├── style.css    # All styles — layout, components, dark theme, responsive rules
├── script.js    # App logic — state management, CRUD, search, filter, render
└── README.md    # This file
```

## Design Highlights

- **Dark dashboard theme** with a purple/cyan gradient accent
- **Colour-coded priority** borders (green · amber · red)
- **Smooth hover animations** on cards, buttons, and stats
- **Accessible** — keyboard navigable, ARIA roles and labels throughout

```
