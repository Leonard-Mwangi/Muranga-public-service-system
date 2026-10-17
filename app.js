(() => {
  'use strict';
  const STORAGE_KEY = 'murangaServicePortal.requests.v1';
  const views = ['home', 'request', 'track', 'admin', 'success'];
  let lastCreatedReference = '';
  let toastTimer;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function loadRequests() {
    try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(data) ? data : []; }
    catch { return []; }
  }
  function saveRequests(requests) { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); }
  function showToast(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }
  function showView(view) {
    if (!views.includes(view)) view = 'home';
    views.forEach(name => { const section = $(`#${name}-view`); if (section) section.classList.toggle('hidden', name !== view); });
    $$('.nav-link').forEach(button => button.classList.toggle('active', button.dataset.view === view || (view === 'success' && button.dataset.view === 'request')));
    if (view === 'admin') renderAdmin();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  $$('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
  function makeReference() {
    let reference;
    const requests = loadRequests();
    do { reference = `MC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`; }
    while (requests.some(request => request.reference === reference));
    return reference;
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleDateString('en-KE', {year:'numeric', month:'short', day:'numeric'});
  }
  function statusClass(status) { return status === 'Resolved' ? 'resolved' : status === 'In progress' ? 'in-progress' : ''; }
  function statusPill(status) { return `<span class="status-pill ${statusClass(status)}">${safe(status)}</span>`; }
  $('#request-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const request = {
      reference: makeReference(), name: String(data.get('name')).trim(), email: String(data.get('email')).trim(),
      phone: String(data.get('phone') || '').trim(), category: String(data.get('category')),
      location: String(data.get('location')).trim(), description: String(data.get('description')).trim(),
      status: 'Pending', createdAt: new Date().toISOString()
    };
    if (request.description.length < 10) { showToast('Please provide at least 10 characters in the description.'); return; }
    try { const requests = loadRequests(); requests.unshift(request); saveRequests(requests); }
    catch { showToast('Could not save in this browser. Check browser storage settings.'); return; }
    lastCreatedReference = request.reference;
    $('#success-reference').textContent = request.reference;
    form.reset(); showView('success');
  });
  function renderTrackResult(request) {
    const target = $('#track-result');
    if (!request) { target.innerHTML = '<div class="request-result"><strong>Request not found</strong><p class="result-meta">Check the reference number. Requests are only available in the browser where they were created.</p></div>'; return; }
    target.innerHTML = `<article class="request-result"><div class="result-head"><div><h3>${safe(request.category)}</h3><div class="result-meta">Reference: <strong>${safe(request.reference)}</strong> · Submitted ${safe(formatDate(request.createdAt))}</div></div>${statusPill(request.status)}</div><p class="result-description">${safe(request.description)}</p><div class="result-location">⌖ ${safe(request.location)}</div><p class="result-meta">Last demo status: ${safe(request.status)}. This is not a live county tracking service.</p></article>`;
  }
  $('#track-form').addEventListener('submit', event => {
    event.preventDefault(); const reference = $('#reference').value.trim().toUpperCase();
    const request = loadRequests().find(item => item.reference.toUpperCase() === reference);
    renderTrackResult(request);
  });
  function renderAdmin() {
    const requests = loadRequests();
    $('#stat-total').textContent = requests.length;
    $('#stat-pending').textContent = requests.filter(r => r.status === 'Pending').length;
    $('#stat-progress').textContent = requests.filter(r => r.status === 'In progress').length;
    $('#stat-resolved').textContent = requests.filter(r => r.status === 'Resolved').length;
    const filter = $('#status-filter').value;
    const shown = requests.filter(r => filter === 'All' || r.status === filter);
    const tbody = $('#requests-table');
    if (!shown.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No requests match this view.</td></tr>'; return; }
    tbody.innerHTML = shown.map(r => `<tr><td><strong>${safe(r.reference)}</strong></td><td><strong>${safe(r.category)}</strong><br><span class="result-meta">${safe(r.description.slice(0,55))}${r.description.length>55?'…':''}</span></td><td>${safe(r.location)}</td><td>${safe(formatDate(r.createdAt))}</td><td>${statusPill(r.status)}</td><td><select class="status-select" data-reference="${safe(r.reference)}" aria-label="Update status for ${safe(r.reference)}"><option ${r.status==='Pending'?'selected':''}>Pending</option><option ${r.status==='In progress'?'selected':''}>In progress</option><option ${r.status==='Resolved'?'selected':''}>Resolved</option></select></td></tr>`).join('');
    $$('.status-select', tbody).forEach(select => select.addEventListener('change', () => {
      const all = loadRequests(); const item = all.find(r => r.reference === select.dataset.reference);
      if (item) { item.status = select.value; saveRequests(all); renderAdmin(); showToast(`Updated ${item.reference} to ${item.status}.`); }
    }));
  }
  $('#status-filter').addEventListener('change', renderAdmin);
  $('#reset-demo').addEventListener('click', () => {
    if (!window.confirm('Delete all demo requests saved in this browser? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY); renderAdmin(); showToast('Demo requests cleared.');
  });
  $('#copy-reference').addEventListener('click', async () => {
    const reference = $('#success-reference').textContent;
    try { await navigator.clipboard.writeText(reference); showToast('Reference number copied.'); }
    catch { showToast(`Your reference number is ${reference}`); }
  });
  $('#success-track').addEventListener('click', () => {
    $('#reference').value = lastCreatedReference || $('#success-reference').textContent;
    showView('track'); renderTrackResult(loadRequests().find(r => r.reference === $('#reference').value));
  });
  // The starter experience uses no seeded fake citizen records; submit a sample request to populate the dashboard.
  showView('home');
})();
