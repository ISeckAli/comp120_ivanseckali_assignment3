/**
 * TaskFlow — script.js
 * Full task manager: CRUD, priorities, due dates, search, filter, stats, localStorage
 */

'use strict';

/* =========================================================
   CONSTANTS & STATE
   ========================================================= */
const STORAGE_KEY = 'taskflow_tasks';

let tasks = [];        // array of task objects
let editingId = null;  // id of task being edited, or null
let activeFilter = 'all';
let searchQuery = '';

/* =========================================================
   DOM REFERENCES
   ========================================================= */
const taskForm     = document.getElementById('task-form');
const titleInput   = document.getElementById('task-title');
const priorityInput = document.getElementById('task-priority');
const dueInput     = document.getElementById('task-due');
const notesInput   = document.getElementById('task-notes');
const titleError   = document.getElementById('title-error');
const submitBtn    = document.getElementById('submit-btn');
const cancelBtn    = document.getElementById('cancel-btn');
const formTitle    = document.getElementById('form-title');

const searchInput  = document.getElementById('search-input');
const filterTabs   = document.querySelectorAll('.filter-tab');

const taskList     = document.getElementById('task-list');
const emptyState   = document.getElementById('empty-state');
const tasksHeading = document.getElementById('tasks-heading');
const tasksCount   = document.getElementById('tasks-count');

const statTotal     = document.getElementById('stat-total-value');
const statPending   = document.getElementById('stat-pending-value');
const statCompleted = document.getElementById('stat-completed-value');
const statHigh      = document.getElementById('stat-high-value');

const toastEl = document.getElementById('toast');

/* =========================================================
   HELPERS
   ========================================================= */
/**
 * Generate a random unique ID.
 * @returns {string}
 */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Format an ISO date string (YYYY-MM-DD) as a human-readable label.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

/**
 * Check if an ISO date string is in the past (before today).
 * @param {string} isoDate
 * @returns {boolean}
 */
function isOverdue(isoDate) {
  if (!isoDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d) < today;
}

/**
 * Escape HTML special characters to prevent XSS when using innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =========================================================
   STORAGE
   ========================================================= */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(tasks)) tasks = [];
  } catch {
    tasks = [];
  }
}

/* =========================================================
   STATS
   ========================================================= */
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const high      = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  statTotal.textContent     = total;
  statPending.textContent   = pending;
  statCompleted.textContent = completed;
  statHigh.textContent      = high;
}

/* =========================================================
   FILTER & SEARCH
   ========================================================= */
/**
 * Return tasks matching current filter and search query.
 * @returns {Array}
 */
function getFilteredTasks() {
  let result = tasks;

  // Apply filter
  switch (activeFilter) {
    case 'pending':   result = result.filter(t => !t.completed); break;
    case 'completed': result = result.filter(t => t.completed);  break;
    case 'high':      result = result.filter(t => t.priority === 'high'); break;
    // 'all' — no filter
  }

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  }

  return result;
}

/* =========================================================
   RENDER
   ========================================================= */
function render() {
  updateStats();

  const filtered = getFilteredTasks();

  // Heading & count
  const labels = { all: 'All Tasks', pending: 'Pending Tasks', completed: 'Completed Tasks', high: 'High Priority' };
  tasksHeading.textContent = labels[activeFilter] || 'Tasks';
  tasksCount.textContent = `${filtered.length} task${filtered.length !== 1 ? 's' : ''}`;

  // Clear existing cards
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
    taskList.style.display = 'none';
  } else {
    emptyState.hidden = true;
    taskList.style.display = '';
    filtered.forEach(task => taskList.appendChild(createTaskCard(task)));
  }
}

/**
 * Build a task card DOM element.
 * @param {Object} task
 * @returns {HTMLElement}
 */
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card${task.completed ? ' completed' : ''}`;
  card.dataset.id = task.id;
  card.dataset.priority = task.priority;
  card.setAttribute('role', 'listitem');

  const prio = task.priority;
  const prioLabel = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High' }[prio] || prio;

  let dueBadge = '';
  if (task.due) {
    if (task.completed) {
      dueBadge = `<span class="badge badge--done">✓ Done</span>`;
    } else if (isOverdue(task.due)) {
      dueBadge = `<span class="badge badge--overdue">⚠ Overdue · ${escapeHtml(formatDate(task.due))}</span>`;
    } else {
      dueBadge = `<span class="badge badge--due">📅 ${escapeHtml(formatDate(task.due))}</span>`;
    }
  }

  const notesHtml = task.notes
    ? `<p class="task-notes">${escapeHtml(task.notes)}</p>`
    : '';

  card.innerHTML = `
    <button class="task-checkbox" data-action="toggle" aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}" title="${task.completed ? 'Mark as pending' : 'Mark as done'}">
      ${task.completed ? '✓' : ''}
    </button>
    <div class="task-body">
      <p class="task-title">${escapeHtml(task.title)}</p>
      ${notesHtml}
      <div class="task-meta">
        <span class="badge badge--${prio}">${escapeHtml(prioLabel)}</span>
        ${dueBadge}
      </div>
    </div>
    <div class="task-actions">
      <button class="btn btn--edit" data-action="edit" aria-label="Edit task">✎ Edit</button>
      <button class="btn btn--danger" data-action="delete" aria-label="Delete task">✕ Delete</button>
    </div>
  `;

  return card;
}

/* =========================================================
   FORM
   ========================================================= */
function resetForm() {
  taskForm.reset();
  titleError.textContent = '';
  editingId = null;
  formTitle.textContent = 'Add New Task';
  submitBtn.innerHTML = '<span class="btn-icon">＋</span> Add Task';
  cancelBtn.hidden = true;
  titleInput.focus();
}

function populateFormForEdit(task) {
  titleInput.value    = task.title;
  priorityInput.value = task.priority;
  dueInput.value      = task.due || '';
  notesInput.value    = task.notes || '';
  titleError.textContent = '';

  formTitle.textContent = 'Edit Task';
  submitBtn.innerHTML = '<span class="btn-icon">✎</span> Save Changes';
  cancelBtn.hidden = false;

  editingId = task.id;
  titleInput.focus();
  // Scroll form into view smoothly
  taskForm.closest('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* =========================================================
   CRUD
   ========================================================= */
function addTask(data) {
  const task = {
    id:        uid(),
    title:     data.title.trim(),
    priority:  data.priority,
    due:       data.due || '',
    notes:     data.notes.trim(),
    completed: false,
    createdAt: Date.now()
  };
  tasks.unshift(task); // add to top of list
  saveTasks();
  render();
  showToast('Task added ✓');
}

function updateTask(id, data) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx] = {
    ...tasks[idx],
    title:    data.title.trim(),
    priority: data.priority,
    due:      data.due || '',
    notes:    data.notes.trim()
  };
  saveTasks();
  render();
  showToast('Task updated ✓');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
  showToast(task.completed ? 'Task completed 🎉' : 'Task marked pending');
}

function deleteTask(id) {
  // Animate card out, then remove
  const card = taskList.querySelector(`[data-id="${id}"]`);
  if (card) {
    card.classList.add('removing');
    card.addEventListener('animationend', () => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      render();
    }, { once: true });
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }
  showToast('Task deleted');
}

/* =========================================================
   TOAST
   ========================================================= */
let toastTimer = null;

function showToast(message, duration = 2200) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
}

/* =========================================================
   EVENTS
   ========================================================= */

// Form submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();

  if (!title) {
    titleError.textContent = 'Please enter a task title.';
    titleInput.focus();
    return;
  }

  titleError.textContent = '';

  const data = {
    title,
    priority: priorityInput.value,
    due:      dueInput.value,
    notes:    notesInput.value
  };

  if (editingId) {
    updateTask(editingId, data);
  } else {
    addTask(data);
  }

  resetForm();
});

// Cancel edit
cancelBtn.addEventListener('click', resetForm);

// Clear validation on typing
titleInput.addEventListener('input', () => {
  if (titleError.textContent) titleError.textContent = '';
});

// Search
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  render();
});

// Filter tabs
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    activeFilter = tab.dataset.filter;
    render();
  });
});

// Task list delegation (toggle, edit, delete)
taskList.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const card = btn.closest('.task-card');
  if (!card) return;
  const id = card.dataset.id;

  switch (btn.dataset.action) {
    case 'toggle': toggleTask(id); break;
    case 'edit': {
      const task = tasks.find(t => t.id === id);
      if (task) populateFormForEdit(task);
      break;
    }
    case 'delete': deleteTask(id); break;
  }
});

/* =========================================================
   INIT
   ========================================================= */
loadTasks();
render();
