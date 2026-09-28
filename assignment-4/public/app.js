const requestForm = document.querySelector('#request-form');
const requestList = document.querySelector('#request-list');
const emptyState = document.querySelector('#empty-state');
const formMessage = document.querySelector('#form-message');
const submitButton = requestForm.querySelector('.submit-button');
const submitLabel = document.querySelector('#submit-label');
const cancelEditButton = document.querySelector('#cancel-edit');
const toast = document.querySelector('#toast');
const searchInput = document.querySelector('#search-requests');
const charCount = document.querySelector('#char-count');
const filters = document.querySelector('.filter-tabs');

let requests = [];
let activeFilter = 'All';
let editingId = null;
let toastTimer;

const statusOptions = ['Open', 'In progress', 'Resolved'];
const categoryAccents = {
  'Facilities & repairs': '#ed7054',
  'IT & Wi-Fi': '#4167d5',
  Housing: '#d1a63b',
  Library: '#60a978',
  'Campus safety': '#bd3f47',
  Accessibility: '#8165b7',
  'Something else': '#718078',
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed. Please try again.');
  return data;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'JUST NOW';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date).toUpperCase();
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function updateOverview() {
  document.querySelector('#open-count').textContent = requests.filter((item) => item.status === 'Open').length;
  document.querySelector('#progress-count').textContent = requests.filter((item) => item.status === 'In progress').length;
  document.querySelector('#resolved-count').textContent = requests.filter((item) => item.status === 'Resolved').length;
  document.querySelector('#request-total').textContent = `${String(requests.length).padStart(2, '0')} REQUEST${requests.length === 1 ? '' : 'S'}`;
  document.querySelector('#all-tab-count').textContent = requests.length;
}

function renderRequest(item, index) {
  const card = makeElement('article', 'request-card');
  card.style.setProperty('--card-accent', categoryAccents[item.category] || '#b6d74b');
  card.style.animationDelay = `${Math.min(index, 8) * 35}ms`;

  const main = makeElement('div', 'request-main');
  const category = makeElement('div', 'request-category');
  category.append(makeElement('span', 'category-square'), document.createTextNode(item.category));
  const title = makeElement('h3', 'request-title', item.description);
  const details = makeElement('p', 'request-details');
  details.append(
    makeElement('span', '', item.name),
    makeElement('span', 'request-date', formatDate(item.createdAt)),
  );
  main.append(category, title, details);

  const priority = makeElement('span', `priority-badge priority-${item.priority.toLowerCase()}`, item.priority);
  const status = document.createElement('select');
  status.className = 'request-state';
  status.setAttribute('aria-label', `Status for ${item.description}`);
  for (const optionValue of statusOptions) {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue === 'In progress' ? 'In motion' : optionValue;
    option.selected = item.status === optionValue;
    status.append(option);
  }
  status.addEventListener('change', async () => {
    try {
      const updated = await apiRequest(`/api/requests/${encodeURIComponent(item.id)}`, {
        method: 'PUT',
        body: JSON.stringify({ status: status.value }),
      });
      replaceRequest(updated);
      showToast('Request status updated.');
    } catch (error) {
      status.value = item.status;
      showToast(error.message);
    }
  });

  const actions = makeElement('div', 'request-actions');
  const editButton = makeElement('button', 'request-action', 'Edit details');
  editButton.type = 'button';
  editButton.addEventListener('click', () => beginEdit(item));
  const deleteButton = makeElement('button', 'request-action delete-action', 'Remove');
  deleteButton.type = 'button';
  deleteButton.addEventListener('click', () => removeRequest(item));
  actions.append(editButton, deleteButton);
  card.append(main, priority, status, actions);
  return card;
}

function renderRequests() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleRequests = requests.filter((item) => {
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    const searchableText = `${item.name} ${item.email} ${item.category} ${item.description}`.toLowerCase();
    return matchesFilter && searchableText.includes(searchTerm);
  });

  requestList.replaceChildren(...visibleRequests.map(renderRequest));
  requestList.setAttribute('aria-busy', 'false');
  emptyState.hidden = visibleRequests.length > 0;
  if (requests.length > 0 && visibleRequests.length === 0) {
    emptyState.querySelector('.empty-title').textContent = 'No matching requests.';
    emptyState.querySelector('.empty-copy').textContent = 'Try another filter or search term.';
  } else {
    emptyState.querySelector('.empty-title').textContent = 'Nothing on the board.';
    emptyState.querySelector('.empty-copy').textContent = 'Your requests will show up here once they\'re sent.';
  }
  updateOverview();
}

function replaceRequest(updated) {
  requests = requests.map((item) => item.id === updated.id ? updated : item);
  renderRequests();
}

function resetForm() {
  requestForm.reset();
  editingId = null;
  submitLabel.textContent = 'Send to the team';
  cancelEditButton.hidden = true;
  formMessage.textContent = '';
  charCount.textContent = '0 / 1000';
}

function beginEdit(item) {
  editingId = item.id;
  requestForm.elements.name.value = item.name;
  requestForm.elements.email.value = item.email;
  requestForm.elements.category.value = item.category;
  requestForm.elements.description.value = item.description;
  const priorityInput = requestForm.querySelector(`input[name="priority"][value="${item.priority}"]`);
  if (priorityInput) priorityInput.checked = true;
  submitLabel.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  charCount.textContent = `${item.description.length} / 1000`;
  formMessage.textContent = '';
  requestForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestForm.elements.name.focus({ preventScroll: true });
}

async function removeRequest(item) {
  if (!window.confirm(`Remove this request from the queue?`)) return;
  try {
    await apiRequest(`/api/requests/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
    requests = requests.filter((entry) => entry.id !== item.id);
    if (editingId === item.id) resetForm();
    renderRequests();
    showToast('Request removed from the queue.');
  } catch (error) {
    showToast(error.message);
  }
}

requestForm.elements.description.addEventListener('input', (event) => {
  charCount.textContent = `${event.target.value.length} / 1000`;
});

cancelEditButton.addEventListener('click', resetForm);
searchInput.addEventListener('input', renderRequests);

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  activeFilter = button.dataset.filter;
  for (const tab of filters.querySelectorAll('[data-filter]')) {
    const isActive = tab === button;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  }
  renderRequests();
});

requestForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';
  const formData = new FormData(requestForm);
  const payload = Object.fromEntries(formData.entries());
  submitButton.disabled = true;
  submitLabel.textContent = editingId ? 'Saving...' : 'Sending...';

  try {
    const savedRequest = await apiRequest(editingId ? `/api/requests/${encodeURIComponent(editingId)}` : '/api/requests', {
      method: editingId ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });
    if (editingId) {
      replaceRequest(savedRequest);
      showToast('Your changes are saved.');
    } else {
      requests.unshift(savedRequest);
      activeFilter = 'All';
      for (const tab of filters.querySelectorAll('[data-filter]')) {
        const isActive = tab.dataset.filter === 'All';
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      }
      showToast('Your request is on the board.');
    }
    resetForm();
    renderRequests();
  } catch (error) {
    formMessage.textContent = error.message;
    submitLabel.textContent = editingId ? 'Save changes' : 'Send to the team';
  } finally {
    submitButton.disabled = false;
  }
});

async function loadRequests() {
  try {
    requests = await apiRequest('/api/requests');
    renderRequests();
  } catch (error) {
    requestList.setAttribute('aria-busy', 'false');
    emptyState.hidden = false;
    emptyState.querySelector('.empty-title').textContent = 'Queue unavailable.';
    emptyState.querySelector('.empty-copy').textContent = error.message;
  }
}

loadRequests();
