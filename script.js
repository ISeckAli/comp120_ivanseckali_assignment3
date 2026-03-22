/**
 * TaskFlow – script.js
 * Frontend task manager using localStorage
 */

/* =========================================================
   STATE
   ========================================================= */
const STORAGE_KEY = 'taskflow_tasks';

let tasks = loadTasks();
let activeFilter = 'all';
let searchQuery  = '';
let pendingDeleteId = null;

/* =========================================================
   PERSISTENCE
   ========================================================= */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* =========================================================
   HELPERS
   ========================================================= */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr + 'T00:00:00');
  return due < today;
}

function escape(str) {
  const el = document.createElement('span');
  el.textContent = str;
  return el.innerHTML;
}

/* =========================================================
   FILTERED / SEARCHED TASK LIST
   ========================================================= */
function getVisibleTasks() {
  const q = searchQuery.toLowerCase().trim();

  return tasks.filter(task => {
    // Filter
    if (activeFilter === 'pending'   && task.completed) return false;
    if (activeFilter === 'completed' && !task.completed) return false;
    if (activeFilter === 'high'      && task.priority !== 'high') return false;

    // Search
    if (q) {
      const haystack = (task.title + ' ' + (task.description || '')).toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/* =========================================================
   RENDER
   ========================================================= */
function render() {
  renderStats();
  renderTaskList();
}

function renderStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending   = total - completed;
  const high      = tasks.filter(t => t.priority === 'high' && !t.completed).length;

  document.getElementById('stat-total').textContent     = total;
  document.getElementById('stat-pending').textContent   = pending;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-high').textContent      = high;
}

function renderTaskList() {
  const list       = document.getElementById('task-list');
  const emptyState = document.getElementById('empty-state');
  const visible    = getVisibleTasks();

  list.innerHTML = '';

  if (visible.length === 0) {
    list.hidden      = true;
    emptyState.hidden = false;
    return;
  }

  list.hidden      = false;
  emptyState.hidden = true;

  visible.forEach(task => {
    list.appendChild(buildTaskCard(task));
  });
}

function buildTaskCard(task) {
  const card = document.createElement('article');
  card.className = `task-card${task.completed ? ' completed' : ''}`;
  card.setAttribute('data-priority', task.priority);
  card.setAttribute('data-id', task.id);
  card.setAttribute('role', 'listitem');

  const priorityLabels = { low: '🟢 Low', medium: '🟡 Medium', high: '🔴 High' };
  const dueBadge = task.due
    ? `<span class="task-due${isOverdue(task.due) && !task.completed ? ' overdue' : ''}">
         📅 ${formatDate(task.due)}${isOverdue(task.due) && !task.completed ? ' · Overdue' : ''}
       </span>`
    : '';

  const descriptionHtml = task.description
    ? `<p class="task-description">${escape(task.description)}</p>`
    : '';

  card.innerHTML = `
    <input
      type="checkbox"
      class="task-checkbox"
      aria-label="Mark '${escape(task.title)}' as ${task.completed ? 'pending' : 'completed'}"
      ${task.completed ? 'checked' : ''}
    />
    <div class="task-content">
      <h3 class="task-title">${escape(task.title)}</h3>
      ${descriptionHtml}
      <div class="task-meta">
        <span class="task-badge badge--${task.priority}" aria-label="Priority: ${task.priority}">
          ${priorityLabels[task.priority]}
        </span>
        ${dueBadge}
      </div>
    </div>
    <div class="task-actions">
      <button class="btn btn--icon edit-btn"   aria-label="Edit task"   title="Edit">✏️</button>
      <button class="btn btn--icon delete-btn" aria-label="Delete task" title="Delete">🗑️</button>
    </div>
  `;

  // Toggle complete
  card.querySelector('.task-checkbox').addEventListener('change', () => toggleComplete(task.id));
  card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
  card.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(task.id));

  return card;
}

/* =========================================================
   TASK CRUD
   ========================================================= */
function addTask(data) {
  tasks.unshift({
    id:          generateId(),
    title:       data.title.trim(),
    description: data.description.trim(),
    priority:    data.priority,
    due:         data.due,
    completed:   false,
    createdAt:   Date.now(),
  });
  saveTasks();
  render();
}

function updateTask(id, data) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  Object.assign(tasks[idx], {
    title:       data.title.trim(),
    description: data.description.trim(),
    priority:    data.priority,
    due:         data.due,
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  render();
}

/* =========================================================
   ADD FORM
   ========================================================= */
const taskForm      = document.getElementById('task-form');
const titleInput    = document.getElementById('task-title');
const priorityInput = document.getElementById('task-priority');
const dueInput      = document.getElementById('task-due');
const descInput     = document.getElementById('task-description');
const cancelBtn     = document.getElementById('form-cancel-btn');
const submitBtn     = document.getElementById('form-submit-btn');
const formTitle     = document.getElementById('form-title');

taskForm.addEventListener('submit', e => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    titleInput.classList.add('input-error');
    return;
  }

  titleInput.classList.remove('input-error');

  addTask({
    title,
    description: descInput.value,
    priority:    priorityInput.value,
    due:         dueInput.value,
  });

  taskForm.reset();
});

titleInput.addEventListener('input', () => {
  titleInput.classList.remove('input-error');
});

/* =========================================================
   EDIT MODAL
   ========================================================= */
const editModal       = document.getElementById('edit-modal');
const editForm        = document.getElementById('edit-form');
const editIdField     = document.getElementById('edit-task-id');
const editTitle       = document.getElementById('edit-title');
const editPriority    = document.getElementById('edit-priority');
const editDue         = document.getElementById('edit-due');
const editDescription = document.getElementById('edit-description');
const modalOverlay    = document.getElementById('modal-overlay');
const modalCancelBtn  = document.getElementById('modal-cancel-btn');

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editIdField.value         = id;
  editTitle.value           = task.title;
  editPriority.value        = task.priority;
  editDue.value             = task.due || '';
  editDescription.value     = task.description || '';

  editModal.hidden = false;
  editTitle.focus();
}

function closeEditModal() {
  editModal.hidden = true;
  editForm.reset();
}

editForm.addEventListener('submit', e => {
  e.preventDefault();

  const title = editTitle.value.trim();
  if (!title) {
    editTitle.focus();
    return;
  }

  updateTask(editIdField.value, {
    title,
    description: editDescription.value,
    priority:    editPriority.value,
    due:         editDue.value,
  });

  closeEditModal();
});

modalOverlay.addEventListener('click', closeEditModal);
modalCancelBtn.addEventListener('click', closeEditModal);

/* =========================================================
   DELETE CONFIRM MODAL
   ========================================================= */
const deleteModal      = document.getElementById('delete-modal');
const deleteOverlay    = document.getElementById('delete-modal-overlay');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelDeleteBtn  = document.getElementById('cancel-delete-btn');

function openDeleteModal(id) {
  pendingDeleteId = id;
  deleteModal.hidden = false;
  confirmDeleteBtn.focus();
}

function closeDeleteModal() {
  deleteModal.hidden  = true;
  pendingDeleteId = null;
}

confirmDeleteBtn.addEventListener('click', () => {
  if (pendingDeleteId) {
    deleteTask(pendingDeleteId);
  }
  closeDeleteModal();
});

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
deleteOverlay.addEventListener('click', closeDeleteModal);

/* =========================================================
   SEARCH & FILTER
   ========================================================= */
document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value;
  render();
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    activeFilter = btn.dataset.filter;
    render();
  });
});

/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!editModal.hidden)   closeEditModal();
    if (!deleteModal.hidden) closeDeleteModal();
  }
});

/* =========================================================
   INIT
   ========================================================= */
render();
