// GovBabu Monitor admin app shell — plain JS, no framework, no build step
// (matches the project's zero-dependency convention). Hash-based client
// router over ONE page shell (sidebar + topbar + <main id="page">).

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', render: renderDashboard },
  { id: 'exams', label: 'Exams', icon: '🎓', render: renderExamsList },
  { id: 'queue', label: 'Review Queue', icon: '✓', render: renderQueue, badgeKey: 'pending_reviews' },
  { id: 'sources', label: 'Source Health', icon: '◉', render: renderSources },
  { id: 'jobs', label: 'Jobs', icon: '↻', render: renderJobs },
  { id: 'audit', label: 'Audit Log', icon: '☷', render: renderAudit },
  { id: 'account', label: 'Account & Security', icon: '⚪', render: renderAccount },
];

const state = { user: null, dashboardStats: null };

// ---------- API ----------
async function api(path, opts) {
  const res = await fetch('/api/admin' + path, opts);
  if (res.status === 401) {
    window.location.href = '/login.html';
    throw new Error('unauthorized');
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || 'request_failed');
    err.code = body.error;
    err.status = res.status;
    throw err;
  }
  return body;
}

function esc(s) {
  return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') || iso.endsWith('Z') ? iso : iso.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return esc(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function relTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso.includes('T') || iso.endsWith('Z') ? iso : iso.replace(' ', 'T') + 'Z');
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function badge(text, type = 'neutral') {
  return `<span class="badge ${type}">${esc(text)}</span>`;
}

// A password <input> with a show/hide eye toggle. Works anywhere via one
// delegated document-level click listener (see below) — no per-instance
// wiring needed, so this is safe to use in the login page too.
function pwInput(id, autocomplete) {
  return `<div class="pw-input-wrap">
    <input type="password" id="${id}" autocomplete="${autocomplete}" required>
    <button type="button" class="pw-toggle" data-for="${id}" aria-label="Show password" title="Show password">👁</button>
  </div>`;
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.pw-toggle');
  if (!btn) return;
  const input = document.getElementById(btn.dataset.for);
  if (!input) return;
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.textContent = showing ? '👁' : '🙈';
  btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  btn.title = btn.getAttribute('aria-label');
});

const CLASSIFICATION_BADGE = {
  CONFIRMED_CHANGE: 'success',
  POSSIBLE_CHANGE: 'warning',
  NEEDS_HUMAN_REVIEW: 'danger',
  PARSING_ERROR: 'danger',
  SOURCE_UNAVAILABLE: 'danger',
};

// Mirrors pipeline/contentStatus.js's TRANSITIONS exactly — kept in sync by
// hand since this is a tiny, static map; the server is still the source of
// truth (it re-validates every transition), this only drives which buttons
// the Status tab offers.
const CONTENT_STATUS_TRANSITIONS = {
  discovered: ['draft', 'archived'],
  draft: ['needs_review', 'archived'],
  needs_review: ['draft', 'verified', 'archived'],
  verified: ['draft', 'published', 'archived'],
  published: ['verified', 'archived'],
  archived: ['draft'],
};
const CONTENT_STATUS_BADGE = {
  discovered: 'neutral', draft: 'neutral', needs_review: 'warning',
  verified: 'brand', published: 'success', archived: 'danger',
};
const CANONICAL_DATE_FIELDS = [
  { key: 'application_start_date', label: 'Application Start' },
  { key: 'application_end_date', label: 'Application End' },
  { key: 'exam_date', label: 'Exam Date' },
  { key: 'admit_card_release_date', label: 'Admit Card Release' },
  { key: 'result_date', label: 'Result Date' },
];
const OVERVIEW_TEXT_FIELDS = [
  { key: 'status', label: 'Status (open/closed)' },
  { key: 'popularity', label: 'Popularity rank' },
  { key: 'vacancies', label: 'Vacancies (display)' },
  { key: 'notif_title', label: 'Notification title' },
  { key: 'apply_start', label: 'Apply start (display)' },
  { key: 'apply_end', label: 'Apply end (display)' },
  { key: 'official_url', label: 'Official URL' },
  { key: 'verified', label: 'Last verified' },
];

// ---------- Toasts ----------
function toast(message, type = 'info') {
  let stack = document.getElementById('toastStack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  el.innerHTML = `<span>${icon}</span><span>${esc(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

// ---------- Confirm modal (replaces window.confirm/prompt) ----------
function confirmModal({ title, body, confirmLabel = 'Confirm', danger = false, showNotes = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h3>${esc(title)}</h3><p>${esc(body)}</p></div>
        <div class="modal-body">
          ${showNotes ? `<div class="field"><label>Notes (optional)</label><textarea id="modalNotes" rows="3" placeholder="Why?"></textarea></div>` : ''}
        </div>
        <div class="modal-foot">
          <button class="btn btn-outline" data-act="cancel">Cancel</button>
          <button class="btn ${danger ? 'btn-danger-solid' : 'btn-primary'}" data-act="ok">${esc(confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const cleanup = (result) => { backdrop.remove(); resolve(result); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) cleanup(null); });
    backdrop.querySelector('[data-act="cancel"]').onclick = () => cleanup(null);
    backdrop.querySelector('[data-act="ok"]').onclick = () => {
      const notes = showNotes ? backdrop.querySelector('#modalNotes').value : undefined;
      cleanup(showNotes ? { notes } : true);
    };
  });
}

// ---------- Shell ----------
function pendingBadgeValue() {
  return state.dashboardStats ? state.dashboardStats.pending_reviews : null;
}

function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-shell" id="appShell">
      <div class="mobile-backdrop" id="mobileBackdrop"></div>
      <aside class="sidebar">
        <div class="sidebar-brand">
          <span class="mark">🔍</span>
          <span class="name">GovBabu<small>Monitor</small></span>
        </div>
        <nav class="sidebar-nav" id="sidebarNav"></nav>
        <button class="sidebar-collapse-btn" id="collapseBtn">≡ Collapse</button>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <button class="mobile-menu-btn" id="mobileMenuBtn">≡</button>
          <div>
            <div class="topbar-title" id="pageTitle">Dashboard</div>
            <div class="topbar-crumb" id="pageCrumb">GovBabu Monitor</div>
          </div>
          <div class="topbar-spacer"></div>
          <span class="clock" id="clock"></span>
          <button class="topbar-icon-btn" id="notifBtn" title="Pending reviews">
            🔔<span class="dot" id="notifDot" style="display:none"></span>
          </button>
          <div class="profile-menu-wrap">
            <button class="profile-btn" id="profileBtn">
              <span class="avatar" id="avatarInitial">?</span>
              <span class="uname" id="profileName">…</span>
            </button>
            <div class="dropdown" id="profileDropdown">
              <div class="dropdown-header">
                <div class="name" id="dropdownName">…</div>
                <div class="role" id="dropdownRole">Admin</div>
              </div>
              <button class="dropdown-item" data-route="account"><span>⚙</span> Account &amp; Security</button>
              <button class="dropdown-item" id="logoutBtn"><span>→</span> Log out</button>
              <button class="dropdown-item danger" id="logoutAllBtn"><span>⚠</span> Log out everywhere</button>
            </div>
          </div>
        </header>
        <main class="page" id="page"></main>
      </div>
    </div>`;

  const nav = document.getElementById('sidebarNav');
  nav.innerHTML = `<div class="nav-group-label">Monitor</div>` + NAV.map((item) => `
    <button type="button" class="nav-item" data-route="${item.id}" aria-current="${item.id === 'dashboard' ? 'page' : 'false'}">
      <span class="icon" aria-hidden="true">${item.icon}</span>
      <span class="label">${esc(item.label)}</span>
      ${item.badgeKey ? `<span class="badge-count" data-badge="${item.badgeKey}" style="display:none"></span>` : ''}
    </button>`).join('');

  nav.addEventListener('click', (e) => {
    const el = e.target.closest('[data-route]');
    if (el) goTo(el.dataset.route);
  });

  document.getElementById('collapseBtn').onclick = () => {
    document.getElementById('appShell').classList.toggle('collapsed');
  };
  document.getElementById('mobileMenuBtn').onclick = () => {
    document.getElementById('appShell').classList.add('mobile-nav-open');
  };
  document.getElementById('mobileBackdrop').onclick = () => {
    document.getElementById('appShell').classList.remove('mobile-nav-open');
  };
  document.getElementById('profileBtn').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('profileDropdown').classList.toggle('open');
  };
  document.addEventListener('click', () => document.getElementById('profileDropdown')?.classList.remove('open'));
  document.getElementById('profileDropdown').addEventListener('click', (e) => {
    const routeBtn = e.target.closest('[data-route]');
    if (routeBtn) goTo(routeBtn.dataset.route);
  });
  document.getElementById('logoutBtn').onclick = doLogout;
  document.getElementById('logoutAllBtn').onclick = doLogoutAll;
  document.getElementById('notifBtn').onclick = () => goTo('queue');

  setInterval(() => {
    document.getElementById('clock').textContent = new Date().toLocaleString();
  }, 1000);
}

async function doLogout() {
  await api('/logout', { method: 'POST' }).catch(() => {});
  window.location.href = '/login.html';
}

async function doLogoutAll() {
  const ok = await confirmModal({
    title: 'Log out everywhere?',
    body: 'This immediately ends every active session for your account, including this one. You will need to log in again.',
    confirmLabel: 'Log out everywhere',
    danger: true,
  });
  if (!ok) return;
  await api('/logout-all', { method: 'POST' }).catch(() => {});
  window.location.href = '/login.html';
}

function setActiveNav(routeId) {
  document.querySelectorAll('.nav-item').forEach((el) => {
    const isActive = el.dataset.route === routeId;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function setPageTitle(title, crumb) {
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageCrumb').textContent = crumb || 'GovBabu Monitor';
  document.title = `${title} — GovBabu Monitor`;
}

function updateNotifBadges() {
  const n = pendingBadgeValue();
  const dot = document.getElementById('notifDot');
  if (dot) {
    dot.style.display = n > 0 ? 'flex' : 'none';
    dot.textContent = n > 9 ? '9+' : n;
  }
  document.querySelectorAll('[data-badge="pending_reviews"]').forEach((el) => {
    el.style.display = n > 0 ? 'inline-block' : 'none';
    el.textContent = n;
  });
}

async function loadWhoAmI() {
  const { user } = await api('/me');
  state.user = user;
  const label = user.display_name || user.username;
  document.getElementById('profileName').textContent = label;
  document.getElementById('dropdownName').textContent = label;
  document.getElementById('dropdownRole').textContent = `@${user.username} · Admin`;
  document.getElementById('avatarInitial').textContent = label.charAt(0).toUpperCase();
}

async function refreshPendingCount() {
  try {
    state.dashboardStats = await api('/dashboard');
    updateNotifBadges();
  } catch { /* non-fatal */ }
}

// ---------- Loading / empty / error state helpers ----------
function skeletonRows(cols, rows = 4) {
  return Array.from({ length: rows }).map(() =>
    `<tr>${Array.from({ length: cols }).map(() => `<td><div class="skel skel-line" style="width:${40 + Math.random() * 50}%"></div></td>`).join('')}</tr>`
  ).join('');
}

function stateRow(colspan, { icon, title, sub }) {
  return `<tr class="state-row"><td colspan="${colspan}">
    <div class="state-block"><div class="state-icon">${icon}</div><div class="state-title">${esc(title)}</div>${sub ? `<div class="state-sub">${esc(sub)}</div>` : ''}</div>
  </td></tr>`;
}

// ---------- Router ----------
// `renderRoute` is the ONLY thing that renders a page, and it never touches
// `location.hash` itself. `goTo` is the ONLY thing that changes the hash.
// Keeping those separate avoids a hash-set -> 'hashchange' -> re-render ->
// hash-set loop, which used to double-render every page (and so double-bind
// every page's event listeners — e.g. a single Approve/Reject click was
// opening two stacked confirmation modals).
let renderToken = 0;

async function renderRoute(routeId) {
  // #/exams/123 is a sub-route of the flat NAV list, not a NAV entry itself
  // — NAV.find() below wouldn't match it and would silently fall back to
  // Dashboard. Detect it explicitly; everything else about routing (active
  // nav highlighting on 'exams', loading skeleton, error handling, the
  // renderToken staleness guard) stays identical.
  const examDetailMatch = routeId.match(/^exams\/(\d+)$/);
  const route = examDetailMatch
    ? { id: 'exams', label: 'Exam', render: (page) => renderExamDetail(page, Number(examDetailMatch[1])) }
    : NAV.find((r) => r.id === routeId) || NAV[0];
  const myToken = ++renderToken;
  document.getElementById('appShell').classList.remove('mobile-nav-open');
  setActiveNav(route.id);
  setPageTitle(route.label);
  const page = document.getElementById('page');
  page.innerHTML = `<div class="kpi-grid">${Array.from({ length: 3 }).map(() => `<div class="kpi-card"><div class="skel skel-line" style="width:50%"></div><div class="skel skel-line" style="width:70%;height:22px;margin-top:8px"></div></div>`).join('')}</div>`;
  try {
    await route.render(page);
  } catch (err) {
    if (myToken !== renderToken) return; // a newer navigation has already taken over `page`
    page.innerHTML = `<div class="card"><div class="card-body"><div class="state-block" style="padding:40px"><div class="state-icon">⚠</div><div class="state-title">Couldn't load this page</div><div class="state-sub">${esc(err.message || 'Unknown error')}</div></div></div></div>`;
  }
  if (myToken !== renderToken) return;
  refreshPendingCount();
}

function goTo(routeId) {
  const target = `#/${routeId}`;
  if (window.location.hash === target) {
    renderRoute(routeId); // hash unchanged -> no 'hashchange' event will fire, so render directly
  } else {
    window.location.hash = target; // triggers 'hashchange' -> renderRoute
  }
}

function routeFromHash() {
  return (window.location.hash.replace(/^#\//, '') || 'dashboard').trim();
}

// ================= PAGES =================

async function renderDashboard(page) {
  setPageTitle('Dashboard', 'Overview of source monitoring & review activity');
  const [stats, auditRows] = await Promise.all([api('/dashboard'), api('/audit-log')]);
  state.dashboardStats = stats;
  updateNotifBadges();

  const cards = [
    { key: 'pending_reviews', label: 'Pending Reviews', icon: '✓', tone: stats.pending_reviews > 0 ? 'warn' : 'good' },
    { key: 'total_sources', label: 'Total Sources', icon: '◉', tone: '' },
    { key: 'active_sources', label: 'Active Sources', icon: '●', tone: '' },
    { key: 'checked_today', label: 'Checked Today', icon: '↻', tone: '' },
    { key: 'changed_today', label: 'Changed Today', icon: 'Δ', tone: '' },
    { key: 'failed_today', label: 'Failed Today', icon: '✕', tone: stats.failed_today > 0 ? 'danger' : 'good' },
    { key: 'unavailable_now', label: 'Unavailable Now', icon: '⚠', tone: stats.unavailable_now > 0 ? 'danger' : 'good' },
  ];

  page.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Dashboard</h1>
        <p>Live counts from the source-monitoring database — nothing here is estimated.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" data-route="queue">Review Pending Changes</button>
      </div>
    </div>
    <div class="kpi-grid">
      ${cards.map((c) => `
        <div class="kpi-card ${c.tone}">
          <div class="kpi-top"><span class="kpi-label">${c.label}</span><span class="kpi-icon">${c.icon}</span></div>
          <div class="kpi-value">${stats[c.key]}</div>
        </div>`).join('')}
    </div>
    <h2 class="section-title">Recent Activity</h2>
    <div class="card">
      <div class="card-body">
        <div class="table-wrap"><table class="data-table"><tbody id="activityBody"></tbody></table></div>
      </div>
    </div>`;

  page.querySelector('[data-route="queue"]').onclick = () => goTo('queue');

  const body = page.querySelector('#activityBody');
  const rows = auditRows.slice(0, 12);
  if (!rows.length) {
    body.innerHTML = stateRow(1, { icon: '📭', title: 'No activity yet', sub: 'Actions like approvals, rejections and password changes will show up here.' });
    return;
  }
  const ACTION_LABEL = {
    approve_change: ['✓', 'Approved a change', 'success'],
    reject_change: ['✕', 'Rejected a change', 'danger'],
    change_password: ['⚪', 'Changed password', 'brand'],
    logout_all_sessions: ['⚠', 'Logged out of all sessions', 'warning'],
  };
  body.innerHTML = rows.map((r) => {
    const [icon, label, tone] = ACTION_LABEL[r.action] || ['•', r.action, 'neutral'];
    let detail = '';
    try {
      const d = JSON.parse(r.details || '{}');
      if (d.field) detail = `${esc(d.field)}: ${esc(d.old ?? '—')} → ${esc(d.new ?? '—')}`;
    } catch { /* not all details are field-shaped */ }
    return `<tr>
      <td style="width:28px">${badge(icon, tone)}</td>
      <td><strong>${esc(label)}</strong>${detail ? `<div class="cell-muted" style="margin-top:2px">${detail}</div>` : ''}</td>
      <td class="cell-muted" style="text-align:right">${relTime(r.created_at)}</td>
    </tr>`;
  }).join('');
}

async function renderQueue(page) {
  setPageTitle('Review Queue', 'Detected changes waiting for human approval before they go live');
  page.innerHTML = `
    <div class="page-head"><div><h1>Review Queue</h1><p>Nothing here is published until you approve it — approving writes straight to the live field history.</p></div></div>
    <div class="card">
      <div class="toolbar">
        <input class="search-input" id="qSearch" placeholder="Search exam or field…">
        <select class="filter-select" id="qClass">
          <option value="">All classifications</option>
          <option>CONFIRMED_CHANGE</option><option>POSSIBLE_CHANGE</option><option>NEEDS_HUMAN_REVIEW</option>
          <option>PARSING_ERROR</option><option>SOURCE_UNAVAILABLE</option>
        </select>
        <div class="toolbar-spacer"></div>
        <span class="result-count" id="qCount"></span>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Exam</th><th>Field</th><th>Old</th><th>New</th><th>Class</th><th>Conf.</th><th>Evidence</th><th>Detected</th><th>Actions</th></tr></thead>
        <tbody id="qBody"><tr><td colspan="9"><div class="skel skel-line"></div></td></tr></tbody>
      </table></div>
    </div>`;

  let all = await api('/review-queue');
  const renderRows = () => {
    const term = page.querySelector('#qSearch').value.trim().toLowerCase();
    const cls = page.querySelector('#qClass').value;
    const filtered = all.filter((r) =>
      (!cls || r.classification === cls) &&
      (!term || r.exam_name.toLowerCase().includes(term) || r.field_name.toLowerCase().includes(term))
    );
    page.querySelector('#qCount').textContent = `${filtered.length} of ${all.length}`;
    const body = page.querySelector('#qBody');
    if (!all.length) { body.innerHTML = stateRow(9, { icon: '✅', title: 'Queue is empty', sub: 'Nothing needs review right now — the monitor will surface new changes here as it finds them.' }); return; }
    if (!filtered.length) { body.innerHTML = stateRow(9, { icon: '🔎', title: 'No matches', sub: 'Try a different search or clear the filter.' }); return; }
    body.innerHTML = filtered.map((r) => `
      <tr>
        <td><a href="${esc(r.source_url)}" target="_blank" rel="noopener">${esc(r.exam_name)}</a></td>
        <td class="cell-mono">${esc(r.field_name)}</td>
        <td class="cell-muted">${r.old_value ? esc(r.old_value) : '<i>none</i>'}</td>
        <td><strong>${r.new_value ? esc(r.new_value) : '<i>none</i>'}</strong></td>
        <td>${badge(r.classification.replace(/_/g, ' '), CLASSIFICATION_BADGE[r.classification] || 'neutral')}</td>
        <td>${(r.confidence * 100).toFixed(0)}%</td>
        <td class="evidence-text wrap">${esc(r.evidence)}</td>
        <td class="cell-muted">${relTime(r.created_at)}</td>
        <td><div class="row-actions">
          <button class="btn btn-primary btn-sm" data-act="approve" data-id="${r.id}">Approve</button>
          <button class="btn btn-danger btn-sm" data-act="reject" data-id="${r.id}">Reject</button>
        </div></td>
      </tr>`).join('');
  };
  renderRows();
  page.querySelector('#qSearch').addEventListener('input', renderRows);
  page.querySelector('#qClass').addEventListener('change', renderRows);

  page.querySelector('#qBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.act;
    const row = all.find((r) => String(r.id) === id);
    const result = await confirmModal({
      title: action === 'approve' ? 'Approve this change?' : 'Reject this change?',
      body: `${row.exam_name} — ${row.field_name}: "${row.old_value ?? 'none'}" → "${row.new_value ?? 'none'}"${action === 'approve' ? '. This immediately becomes the live value.' : '. This stays in the audit trail but never gets applied.'}`,
      confirmLabel: action === 'approve' ? 'Approve' : 'Reject',
      danger: action === 'reject',
      showNotes: true,
    });
    if (!result) return;
    btn.closest('tr').style.opacity = '0.5';
    try {
      await api(`/change-events/${id}/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ notes: result.notes || '' }) });
      toast(`Change ${action === 'approve' ? 'approved' : 'rejected'}.`, 'success');
      all = await api('/review-queue');
      renderRows();
      refreshPendingCount();
    } catch (err) {
      toast(`Couldn't ${action}: ${err.code || err.message}`, 'error');
      renderRows();
    }
  });
}

async function renderSources(page) {
  setPageTitle('Source Health', 'Every official source being watched, and whether it’s actually reachable');
  page.innerHTML = `
    <div class="page-head"><div><h1>Source Health</h1><p>Spot broken or stale sources before they silently stop feeding data.</p></div></div>
    <div class="card">
      <div class="toolbar">
        <input class="search-input" id="sSearch" placeholder="Search exam or source…">
        <div class="toolbar-spacer"></div>
        <span class="result-count" id="sCount"></span>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Exam</th><th>Source</th><th>Type</th><th>Status</th><th>Last Checked</th><th>Response</th><th>Failures</th></tr></thead>
        <tbody id="sBody"><tr><td colspan="7"><div class="skel skel-line"></div></td></tr></tbody>
      </table></div>
    </div>`;
  const all = await api('/sources');
  const renderRows = () => {
    const term = page.querySelector('#sSearch').value.trim().toLowerCase();
    const filtered = all.filter((r) => !term || r.exam_name.toLowerCase().includes(term) || r.label.toLowerCase().includes(term));
    page.querySelector('#sCount').textContent = `${filtered.length} of ${all.length}`;
    const body = page.querySelector('#sBody');
    if (!all.length) { body.innerHTML = stateRow(7, { icon: '📭', title: 'No sources configured' }); return; }
    if (!filtered.length) { body.innerHTML = stateRow(7, { icon: '🔎', title: 'No matches' }); return; }
    body.innerHTML = filtered.map((r) => {
      let status = ['success', 'Healthy'];
      if (r.consecutive_failures >= 3) status = ['danger', 'Unavailable'];
      else if (r.consecutive_failures > 0) status = ['warning', 'Flaky'];
      else if (!r.last_checked_at) status = ['neutral', 'Never checked'];
      return `<tr>
        <td>${esc(r.exam_name)}</td>
        <td><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a></td>
        <td>${badge(r.source_type, 'neutral')}</td>
        <td>${badge(status[1], status[0])}</td>
        <td class="cell-muted">${fmtDate(r.last_checked_at)}</td>
        <td class="cell-muted">${r.last_response_time_ms ? r.last_response_time_ms + 'ms' : '—'} ${r.last_http_status ? `(${r.last_http_status})` : ''}</td>
        <td class="${r.consecutive_failures > 0 ? 'cell-muted' : 'cell-muted'}">${r.consecutive_failures > 0 ? badge(r.consecutive_failures, 'danger') : '0'}</td>
      </tr>`;
    }).join('');
  };
  renderRows();
  page.querySelector('#sSearch').addEventListener('input', renderRows);
}

async function renderJobs(page) {
  setPageTitle('Jobs', 'Recent monitoring runs, one row per source check');
  page.innerHTML = `
    <div class="page-head"><div><h1>Jobs</h1><p>The last 200 scheduled/executed monitoring checks.</p></div></div>
    <div class="card"><div class="table-wrap"><table class="data-table">
      <thead><tr><th>Source</th><th>Status</th><th>Scheduled</th><th>Started</th><th>Finished</th><th>Attempt</th></tr></thead>
      <tbody id="jBody"><tr><td colspan="6"><div class="skel skel-line"></div></td></tr></tbody>
    </table></div></div>`;
  const rows = await api('/jobs');
  const body = page.querySelector('#jBody');
  if (!rows.length) { body.innerHTML = stateRow(6, { icon: '📭', title: 'No jobs recorded yet', sub: 'Runs the scheduler kicks off, or a manual check-now, will appear here.' }); return; }
  const STATUS_TONE = { success: 'success', failed: 'danger', running: 'warning', queued: 'neutral' };
  body.innerHTML = rows.map((j) => `
    <tr>
      <td>${esc(j.source_label)}</td>
      <td>${badge(j.status, STATUS_TONE[j.status] || 'neutral')}</td>
      <td class="cell-muted">${fmtDate(j.scheduled_at)}</td>
      <td class="cell-muted">${fmtDate(j.started_at)}</td>
      <td class="cell-muted">${fmtDate(j.finished_at)}</td>
      <td class="cell-muted">${j.attempt_number}</td>
    </tr>`).join('');
}

async function renderAudit(page) {
  setPageTitle('Audit Log', 'Every admin action, permanently recorded');
  page.innerHTML = `
    <div class="page-head"><div><h1>Audit Log</h1><p>Approvals, rejections and account changes — nothing here can be edited or deleted.</p></div></div>
    <div class="card"><div class="table-wrap"><table class="data-table">
      <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead>
      <tbody id="aBody"><tr><td colspan="5"><div class="skel skel-line"></div></td></tr></tbody>
    </table></div></div>`;
  const rows = await api('/audit-log');
  const body = page.querySelector('#aBody');
  if (!rows.length) { body.innerHTML = stateRow(5, { icon: '📭', title: 'No audit entries yet' }); return; }
  body.innerHTML = rows.map((r) => `
    <tr>
      <td class="cell-muted">${fmtDate(r.created_at)}</td>
      <td class="cell-mono">admin #${esc(r.actor)}</td>
      <td>${badge(r.action.replace(/_/g, ' '), 'brand')}</td>
      <td class="cell-muted">${esc(r.entity_type)} #${esc(r.entity_id ?? '—')}</td>
      <td class="evidence-text wrap">${esc(r.details || '')}</td>
    </tr>`).join('');
}

async function renderAccount(page) {
  setPageTitle('Account & Security', 'Your profile, password and active sessions');
  const [{ user }, { sessions }] = await Promise.all([api('/me'), api('/sessions')]);
  page.innerHTML = `
    <div class="page-head"><div><h1>Account &amp; Security</h1><p>Manage your own credentials — there is no separate user-management system yet.</p></div></div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-head"><h2>Profile</h2></div>
      <div class="card-body" style="padding:18px 18px 20px">
        <div style="display:flex;align-items:center;gap:14px">
          <span class="avatar" style="width:44px;height:44px;font-size:17px">${esc((user.display_name || user.username).charAt(0).toUpperCase())}</span>
          <div>
            <div style="font-weight:700;font-size:15px">${esc(user.display_name || user.username)}</div>
            <div class="cell-muted">@${esc(user.username)} · Admin</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px">
      <div class="card-head"><h2>Change Password</h2><span class="hint">You'll stay signed in here; other sessions get logged out</span></div>
      <div class="card-body" style="padding:18px">
        <form id="pwForm" style="max-width:380px">
          <div class="field" id="fCurrent">
            <label>Current password</label>
            ${pwInput('curPw', 'current-password')}
            <div class="field-error">Current password is incorrect.</div>
          </div>
          <div class="field" id="fNew">
            <label>New password</label>
            ${pwInput('newPw', 'new-password')}
            <div class="pw-strength" id="pwStrengthBar"><i></i><i></i><i></i></div>
            <div class="field-hint">At least 8 characters, with a letter and a number.</div>
            <div class="field-error">That doesn't meet the password requirements.</div>
          </div>
          <div class="field" id="fConfirm">
            <label>Confirm new password</label>
            ${pwInput('confirmPw', 'new-password')}
            <div class="field-error">Passwords don't match.</div>
          </div>
          <button type="submit" class="btn btn-primary" id="pwSubmit">Update Password</button>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Active Sessions</h2><span class="hint">${sessions.length} session${sessions.length === 1 ? '' : 's'}</span></div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Started</th><th>Expires</th><th>Status</th></tr></thead>
        <tbody>${sessions.map((s) => `
          <tr>
            <td class="cell-muted">${fmtDate(s.created_at)}${s.is_current ? ' ' + badge('this device', 'brand') : ''}</td>
            <td class="cell-muted">${fmtDate(s.expires_at)}</td>
            <td>${s.revoked_at ? badge('revoked', 'neutral') : badge('active', 'success')}</td>
          </tr>`).join('')}</tbody>
      </table></div>
      <div style="padding:14px 18px"><button class="btn btn-danger" id="logoutAllBtn2">Log out of all sessions</button></div>
    </div>`;

  const strengthBar = page.querySelector('#pwStrengthBar');
  page.querySelector('#newPw').addEventListener('input', (e) => {
    const v = e.target.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[a-zA-Z]/.test(v) && /[0-9]/.test(v)) score++;
    if (v.length >= 12 && /[^a-zA-Z0-9]/.test(v)) score++;
    strengthBar.className = 'pw-strength ' + (score <= 1 ? 'weak' : score === 2 ? 'fair' : 'strong');
  });

  page.querySelector('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const curPw = page.querySelector('#curPw').value;
    const newPw = page.querySelector('#newPw').value;
    const confirmPw = page.querySelector('#confirmPw').value;
    ['fCurrent', 'fNew', 'fConfirm'].forEach((id) => page.querySelector('#' + id).classList.remove('has-error'));

    let hasError = false;
    const isStrong = newPw.length >= 8 && /[a-zA-Z]/.test(newPw) && /[0-9]/.test(newPw);
    if (!isStrong) { page.querySelector('#fNew').classList.add('has-error'); hasError = true; }
    if (newPw !== confirmPw) { page.querySelector('#fConfirm').classList.add('has-error'); hasError = true; }
    if (hasError) return;

    const submitBtn = page.querySelector('#pwSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating…';
    try {
      await api('/change-password', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      toast('Password updated. Other sessions were logged out.', 'success');
      page.querySelector('#pwForm').reset();
      strengthBar.className = 'pw-strength';
      renderAccount(page);
    } catch (err) {
      if (err.code === 'invalid_current_password') { page.querySelector('#fCurrent').classList.add('has-error'); }
      else if (err.code === 'password_too_weak') { page.querySelector('#fNew').classList.add('has-error'); }
      else if (err.code === 'password_reused') {
        page.querySelector('#fNew').classList.add('has-error');
        page.querySelector('#fNew .field-error').textContent = 'New password must be different from your current one.';
      } else { toast('Could not update password.', 'error'); }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });

  page.querySelector('#logoutAllBtn2').onclick = doLogoutAll;
}

// ---------- Exams (Phase 1 data-foundation UI) ----------

async function renderExamsList(page) {
  setPageTitle('Exams', 'Every exam record, any content status — draft through published');
  page.innerHTML = `
    <div class="page-head">
      <div><h1>Exams</h1><p>The admin view of every exam, regardless of whether it's public yet.</p></div>
      <div class="page-actions"><button class="btn btn-primary" id="newExamBtn">New Exam</button></div>
    </div>
    <div class="card">
      <div class="toolbar">
        <input class="search-input" id="exSearch" placeholder="Search name or code…">
        <select class="filter-select" id="exStatus">
          <option value="">All statuses</option>
          <option value="discovered">Discovered</option>
          <option value="draft">Draft</option>
          <option value="needs_review">Needs Review</option>
          <option value="verified">Verified</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <div class="toolbar-spacer"></div>
        <span class="result-count" id="exCount"></span>
      </div>
      <div class="table-wrap"><table class="data-table">
        <thead><tr><th>Name</th><th>Code</th><th>Organisation</th><th>Category</th><th>Content Status</th><th>Updated</th></tr></thead>
        <tbody id="exBody"><tr><td colspan="6"><div class="skel skel-line"></div></td></tr></tbody>
      </table></div>
    </div>`;

  page.querySelector('#newExamBtn').onclick = () => openNewExamModal();

  const load = async () => {
    const status = page.querySelector('#exStatus').value;
    const search = page.querySelector('#exSearch').value.trim();
    const qs = new URLSearchParams();
    if (status) qs.set('content_status', status);
    if (search) qs.set('search', search);
    const { exams } = await api('/exams?' + qs.toString());
    page.querySelector('#exCount').textContent = `${exams.length} exam${exams.length === 1 ? '' : 's'}`;
    const body = page.querySelector('#exBody');
    if (!exams.length) { body.innerHTML = stateRow(6, { icon: '🎓', title: 'No exams match', sub: 'Try a different search or filter, or create one.' }); return; }
    body.innerHTML = exams.map((e) => `
      <tr class="row-link" data-id="${e.id}" style="cursor:pointer">
        <td><strong>${esc(e.name)}</strong></td>
        <td class="cell-mono">${esc(e.code)}</td>
        <td class="cell-muted">${esc(e.org_name)}</td>
        <td class="cell-muted">${esc(e.category || '—')}</td>
        <td>${badge(e.content_status.replace(/_/g, ' '), CONTENT_STATUS_BADGE[e.content_status] || 'neutral')}</td>
        <td class="cell-muted">${relTime(e.updated_at)}</td>
      </tr>`).join('');
    body.querySelectorAll('tr[data-id]').forEach((row) => {
      row.addEventListener('click', () => goTo('exams/' + row.dataset.id));
    });
  };
  page.querySelector('#exSearch').addEventListener('input', load);
  page.querySelector('#exStatus').addEventListener('change', load);
  await load();
}

function openNewExamModal() {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:480px">
        <div class="modal-head"><h3>New Exam</h3><p>Starts as Draft — invisible to the public site until published.</p></div>
        <div class="modal-body">
          <div class="field"><label>Organisation</label>
            <select id="neOrg"><option value="">Loading…</option></select>
          </div>
          <div id="neNewOrgFields" style="display:none">
            <div class="field"><label>New organisation name</label><input id="neOrgName" placeholder="e.g. Staff Selection Commission"></div>
            <div class="field"><label>Short code</label><input id="neOrgCode" placeholder="e.g. SSC"></div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="neToggleOrg" style="margin-bottom:14px">+ New organisation instead</button>
          <div class="field"><label>Exam name</label><input id="neName" placeholder="e.g. SSC CGL 2027"></div>
          <div class="field"><label>Code (unique)</label><input id="neCode" placeholder="e.g. SSC-CGL-2027"></div>
          <div class="field"><label>Category</label><input id="neCategory" placeholder="e.g. Central Govt"></div>
          <div class="field-error" id="neError" style="display:block;min-height:16px"></div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-outline" data-act="cancel">Cancel</button>
          <button class="btn btn-primary" data-act="ok">Create</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const cleanup = (result) => { backdrop.remove(); resolve(result); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) cleanup(null); });
    backdrop.querySelector('[data-act="cancel"]').onclick = () => cleanup(null);

    const orgSelect = backdrop.querySelector('#neOrg');
    let usingNewOrg = false;
    api('/organizations').then(({ organizations }) => {
      orgSelect.innerHTML = organizations.map((o) => `<option value="${o.id}">${esc(o.name)}</option>`).join('') || '<option value="">No organisations yet</option>';
    });
    backdrop.querySelector('#neToggleOrg').onclick = (e) => {
      usingNewOrg = !usingNewOrg;
      backdrop.querySelector('#neNewOrgFields').style.display = usingNewOrg ? 'block' : 'none';
      orgSelect.closest('.field').style.display = usingNewOrg ? 'none' : 'block';
      e.target.textContent = usingNewOrg ? '← Use an existing organisation' : '+ New organisation instead';
    };

    backdrop.querySelector('[data-act="ok"]').onclick = async () => {
      const errEl = backdrop.querySelector('#neError');
      errEl.textContent = '';
      try {
        let orgId = orgSelect.value;
        if (usingNewOrg) {
          const name = backdrop.querySelector('#neOrgName').value.trim();
          const short_code = backdrop.querySelector('#neOrgCode').value.trim();
          if (!name || !short_code) { errEl.textContent = 'Organisation name and short code are required.'; return; }
          const org = await api('/organizations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, short_code }) });
          orgId = org.id;
        }
        const name = backdrop.querySelector('#neName').value.trim();
        const code = backdrop.querySelector('#neCode').value.trim();
        const category = backdrop.querySelector('#neCategory').value.trim();
        if (!orgId) { errEl.textContent = 'Choose or create an organisation.'; return; }
        if (!name || !code) { errEl.textContent = 'Exam name and code are required.'; return; }
        const exam = await api('/exams', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ org_id: orgId, name, code, category }) });
        cleanup(true);
        toast('Exam created as Draft.', 'success');
        goTo('exams/' + exam.id);
      } catch (err) {
        errEl.textContent = err.code === 'exam_code_taken' ? 'That exam code is already in use.' : err.code === 'org_code_taken' ? 'That organisation short code is already in use.' : 'Could not create the exam.';
      }
    };
  });
}

async function renderExamDetail(page, examId) {
  const detail = await api('/exams/' + examId);
  setPageTitle(detail.exam.name, `${detail.exam.code} · Exam detail`);
  const tabs = ['Overview', 'Posts', 'Important Dates', 'Documents', 'Status'];
  let activeTab = 'Overview';

  page.innerHTML = `
    <div class="page-head">
      <div>
        <h1>${esc(detail.exam.name)}</h1>
        <p class="cell-mono">${esc(detail.exam.code)} ${badge(detail.exam.content_status.replace(/_/g, ' '), CONTENT_STATUS_BADGE[detail.exam.content_status] || 'neutral')}</p>
      </div>
      <div class="page-actions"><button class="btn btn-outline btn-sm" id="backToExams">← All Exams</button></div>
    </div>
    <div class="tabs" id="examTabs">${tabs.map((t) => `<button type="button" class="tab${t === activeTab ? ' active' : ''}" data-tab="${t}">${t}</button>`).join('')}</div>
    <div id="tabBody"></div>`;

  page.querySelector('#backToExams').onclick = () => goTo('exams');

  const tabBody = page.querySelector('#tabBody');
  async function showTab(tab) {
    page.querySelectorAll('#examTabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    if (tab === 'Overview') return renderExamOverviewTab(tabBody, examId, detail);
    if (tab === 'Posts') return renderExamPostsTab(tabBody, examId);
    if (tab === 'Important Dates') return renderExamDatesTab(tabBody, examId);
    if (tab === 'Documents') return renderExamDocumentsTab(tabBody, examId);
    if (tab === 'Status') return renderExamStatusTab(tabBody, examId, detail.exam.content_status);
  }
  page.querySelector('#examTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (btn) showTab(btn.dataset.tab);
  });
  await showTab(activeTab);
}

async function renderExamOverviewTab(container, examId, detail) {
  container.innerHTML = `<div class="card"><div class="card-body" style="padding:18px">
    <form id="ovForm" style="max-width:520px">
      ${OVERVIEW_TEXT_FIELDS.map((f) => `
        <div class="field"><label>${esc(f.label)}</label>
          <input data-field="${f.key}" value="${esc(detail.fields[f.key] || '')}">
        </div>`).join('')}
      <button type="submit" class="btn btn-primary" id="ovSave">Save Overview</button>
      <span class="result-count" id="ovSaved" style="margin-left:10px"></span>
    </form>
  </div></div>`;
  container.querySelector('#ovForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#ovSave');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const inputs = container.querySelectorAll('[data-field]');
      for (const input of inputs) {
        await api(`/exams/${examId}/fields/${input.dataset.field}`, {
          method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: input.value }),
        });
      }
      container.querySelector('#ovSaved').textContent = 'Saved ✓';
      toast('Overview saved.', 'success');
    } catch {
      toast('Could not save one or more fields.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Overview';
    }
  });
}

async function renderExamPostsTab(container, examId) {
  container.innerHTML = `<div class="card">
    <div class="card-head"><h2>Posts</h2><button class="btn btn-primary btn-sm" id="addPostBtn">+ Add Post</button></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Post</th><th>Vacancies</th><th>Qualification</th><th>Pay Level</th><th>Actions</th></tr></thead>
      <tbody id="postsBody"><tr><td colspan="5"><div class="skel skel-line"></div></td></tr></tbody>
    </table></div>
  </div>`;

  async function load() {
    const { posts } = await api(`/exams/${examId}/posts`);
    const body = container.querySelector('#postsBody');
    if (!posts.length) { body.innerHTML = stateRow(5, { icon: '📋', title: 'No posts added yet' }); return; }
    body.innerHTML = posts.map((p) => `
      <tr>
        <td><strong>${esc(p.post_name)}</strong>${p.department ? `<div class="cell-muted">${esc(p.department)}</div>` : ''}</td>
        <td>${p.vacancies ?? esc(p.vacancies_display) ?? '—'}</td>
        <td class="cell-muted wrap">${esc(p.qualification || '—')}</td>
        <td class="cell-muted">${esc(p.pay_level || '—')}${p.pay_band ? `<div class="cell-muted" style="font-size:11px">${esc(p.pay_band)}</div>` : ''}</td>
        <td><button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button></td>
      </tr>`).join('');
    body.querySelectorAll('[data-del]').forEach((btn) => {
      btn.onclick = async () => {
        const ok = await confirmModal({ title: 'Delete this post?', body: 'This cannot be undone.', confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        await api(`/posts/${btn.dataset.del}`, { method: 'DELETE' });
        toast('Post deleted.', 'success');
        load();
      };
    });
  }
  container.querySelector('#addPostBtn').onclick = async () => {
    const result = await promptPostFields();
    if (!result) return;
    await api(`/exams/${examId}/posts`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(result) });
    toast('Post added.', 'success');
    load();
  };
  await load();
}

function promptPostFields() {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop open';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" style="max-width:480px">
        <div class="modal-head"><h3>Add Post</h3></div>
        <div class="modal-body">
          <div class="field"><label>Post name</label><input id="pfName" placeholder="e.g. Inspector (Income Tax)"></div>
          <div class="field"><label>Vacancies (number)</label><input id="pfVac" type="number"></div>
          <div class="field"><label>Qualification</label><input id="pfQual"></div>
          <div class="field"><label>Age limit</label><input id="pfAge"></div>
          <div class="field"><label>Pay level</label><input id="pfLevel" placeholder="e.g. Level 7"></div>
          <div class="field"><label>Pay band</label><input id="pfBand" placeholder="e.g. ₹44,900–₹1,42,400"></div>
        </div>
        <div class="modal-foot">
          <button class="btn btn-outline" data-act="cancel">Cancel</button>
          <button class="btn btn-primary" data-act="ok">Add</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const cleanup = (result) => { backdrop.remove(); resolve(result); };
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) cleanup(null); });
    backdrop.querySelector('[data-act="cancel"]').onclick = () => cleanup(null);
    backdrop.querySelector('[data-act="ok"]').onclick = () => {
      const name = backdrop.querySelector('#pfName').value.trim();
      if (!name) return;
      cleanup({
        post_name: name,
        vacancies: backdrop.querySelector('#pfVac').value || null,
        qualification: backdrop.querySelector('#pfQual').value || null,
        age_limit: backdrop.querySelector('#pfAge').value || null,
        pay_level: backdrop.querySelector('#pfLevel').value || null,
        pay_band: backdrop.querySelector('#pfBand').value || null,
      });
    };
  });
}

async function renderExamDatesTab(container, examId) {
  const { fields, history } = await api(`/exams/${examId}/fields`);
  container.innerHTML = `<div class="card"><div class="card-body" style="padding:18px">
    <form id="datesForm" style="max-width:420px">
      ${CANONICAL_DATE_FIELDS.map((f) => `
        <div class="field"><label>${esc(f.label)}</label>
          <input type="date" data-field="${f.key}" value="${esc(fields[f.key] || '')}">
        </div>`).join('')}
      <button type="submit" class="btn btn-primary" id="datesSave">Save Dates</button>
    </form>
    <h2 class="section-title">History</h2>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Field</th><th>Value</th><th>Effective</th><th>Current</th></tr></thead>
      <tbody>${
        history.filter((h) => CANONICAL_DATE_FIELDS.some((f) => f.key === h.field_name)).map((h) => `
          <tr><td class="cell-mono">${esc(h.field_name)}</td><td>${esc(h.value)}</td><td class="cell-muted">${fmtDate(h.effective_at)}</td><td>${h.is_current ? badge('current', 'success') : ''}</td></tr>
        `).join('') || `<tr class="state-row"><td colspan="4" class="cell-muted" style="text-align:center;padding:20px">No date history yet.</td></tr>`
      }</tbody>
    </table></div>
  </div></div>`;

  container.querySelector('#datesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = container.querySelector('#datesSave');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const inputs = container.querySelectorAll('[data-field]');
      for (const input of inputs) {
        if (!input.value) continue; // don't clobber an unset date with empty string
        await api(`/exams/${examId}/fields/${input.dataset.field}`, {
          method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ value: input.value }),
        });
      }
      toast('Dates saved.', 'success');
      renderExamDatesTab(container, examId);
    } catch {
      toast('Could not save one or more dates.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Dates';
    }
  });
}

async function renderExamDocumentsTab(container, examId) {
  container.innerHTML = `<div class="card">
    <div class="card-head"><h2>Documents</h2></div>
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Label</th><th>Role</th><th>URL</th><th>Fetched</th></tr></thead>
      <tbody id="docsBody"><tr><td colspan="4"><div class="skel skel-line"></div></td></tr></tbody>
    </table></div>
    <div class="card-body" style="padding:16px 18px;border-top:1px solid var(--line)">
      <form id="docForm" style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
        <div class="field" style="margin:0;flex:2;min-width:180px"><label>Label</label><input id="docLabel" placeholder="Official Notification" required></div>
        <div class="field" style="margin:0;flex:2;min-width:220px"><label>URL</label><input id="docUrl" placeholder="https://…" required></div>
        <div class="field" style="margin:0;flex:1;min-width:140px"><label>Type</label>
          <select id="docRole">
            <option value="notification">Notification</option>
            <option value="corrigendum">Corrigendum</option>
            <option value="admit_card">Admit Card</option>
            <option value="result">Result</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Add Document</button>
      </form>
    </div>
  </div>`;

  async function load() {
    const { documents } = await api(`/exams/${examId}/documents`);
    const body = container.querySelector('#docsBody');
    if (!documents.length) { body.innerHTML = stateRow(4, { icon: '📄', title: 'No documents registered yet' }); return; }
    body.innerHTML = documents.map((d) => `
      <tr>
        <td>${esc(d.label)}</td>
        <td>${badge(d.role, 'neutral')}</td>
        <td><a href="${esc(d.url)}" target="_blank" rel="noopener">${esc(d.url)}</a></td>
        <td class="cell-muted">${fmtDate(d.fetched_at)}</td>
      </tr>`).join('');
  }
  container.querySelector('#docForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const label = container.querySelector('#docLabel').value.trim();
    const docUrl = container.querySelector('#docUrl').value.trim();
    const role = container.querySelector('#docRole').value;
    if (!label || !docUrl) return;
    try {
      await api(`/exams/${examId}/documents`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ label, url: docUrl, role }) });
      toast('Document registered.', 'success');
      container.querySelector('#docForm').reset();
      load();
    } catch {
      toast('Could not register the document.', 'error');
    }
  });
  await load();
}

async function renderExamStatusTab(container, examId, currentStatus) {
  const nextOptions = CONTENT_STATUS_TRANSITIONS[currentStatus] || [];
  container.innerHTML = `<div class="card"><div class="card-body" style="padding:18px">
    <p>Current status: ${badge(currentStatus.replace(/_/g, ' '), CONTENT_STATUS_BADGE[currentStatus] || 'neutral')}</p>
    <div class="divider"></div>
    <p class="cell-muted" style="margin-bottom:10px">${nextOptions.length ? 'Move to:' : 'No further transitions from this status.'}</p>
    <div class="row-actions">${nextOptions.map((s) => `<button class="btn ${s === 'archived' ? 'btn-danger' : 'btn-primary'} btn-sm" data-to="${s}">${s.replace(/_/g, ' ')}</button>`).join('')}</div>
  </div></div>`;
  container.querySelectorAll('[data-to]').forEach((btn) => {
    btn.onclick = async () => {
      const to = btn.dataset.to;
      const ok = await confirmModal({
        title: `Move to "${to.replace(/_/g, ' ')}"?`,
        body: to === 'published' ? 'This makes the exam publicly visible immediately.' : `Changes the exam's content status from "${currentStatus.replace(/_/g, ' ')}" to "${to.replace(/_/g, ' ')}".`,
        confirmLabel: 'Confirm',
        danger: to === 'archived',
      });
      if (!ok) return;
      try {
        await api(`/exams/${examId}/status`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ to }) });
        toast(`Status changed to ${to.replace(/_/g, ' ')}.`, 'success');
        renderExamStatusTab(container, examId, to);
      } catch {
        toast('Could not change status.', 'error');
      }
    };
  });
}

// ---------- Boot ----------
(async function init() {
  renderShell();
  try {
    await loadWhoAmI();
  } catch { return; } // api() already redirects to /login.html on 401
  window.addEventListener('hashchange', () => renderRoute(routeFromHash()));
  renderRoute(routeFromHash());
  setInterval(refreshPendingCount, 30000);
})();
