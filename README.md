# TaskFlow — Task Manager

A modern, visually impressive task manager web application built with plain HTML, CSS, and JavaScript.

## ✨ Features

| Feature | Details |
|---|---|
| **Add tasks** | Enter a title, choose priority, set an optional due date and notes |
| **Edit tasks** | Inline editing — form pre-fills with task data |
| **Delete tasks** | Smooth slide-out animation on removal |
| **Complete tasks** | Click the checkbox to toggle done / pending |
| **Priority levels** | 🟢 Low · 🟡 Medium · 🔴 High — shown as coloured badges & left-border accent |
| **Due dates** | Optional date picker; overdue tasks are highlighted automatically |
| **Search** | Live keyword search across title and notes |
| **Filters** | All · Pending · Completed · High Priority |
| **Statistics** | Dashboard cards: Total, Pending, Completed, High Priority |
| **Persistence** | Tasks are saved in `localStorage` and restored on page refresh |

## 🚀 Getting Started

No build tools or dependencies required — open `index.html` in any modern browser.

```
comp120_ivanseckali_assignment3/
├── index.html   # App markup
├── style.css    # All styling (dark dashboard theme, responsive)
├── script.js    # App logic (CRUD, localStorage, search, filter)
└── README.md    # This file
```

## 🎨 Design

- **Dark dashboard** colour scheme with a purple/teal accent palette
- **Responsive** — works on desktop and mobile (≥ 320 px wide)
- **Animated** — cards slide in on creation, slide out on deletion, smooth hover states
- **Accessible** — semantic HTML, ARIA labels, keyboard-navigable

## 🛠 Technologies

- HTML5
- CSS3 (custom properties, grid, flexbox, animations)
- Vanilla JavaScript (ES2020, no frameworks)

## 📋 Usage

1. **Add a task** — Fill in the title (required) and optional fields, then click **Add Task**.
2. **Complete a task** — Click the checkbox on the left of any card.
3. **Edit a task** — Click **✎ Edit**; the form will pre-fill. Click **Save Changes** when done.
4. **Delete a task** — Click **✕ Delete**. The card animates out.
5. **Search** — Type in the search box to filter in real time.
6. **Filter** — Click any tab (All / Pending / Completed / High Priority) to narrow the list.

