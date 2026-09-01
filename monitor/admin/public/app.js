// GovBabu Monitor admin app shell — plain JS, no framework, no build step
// (matches the project's zero-dependency convention). Hash-based client
// router over ONE page shell (sidebar + topbar + <main id="page">).

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', render: renderDashboard },
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
  const route = NAV.find((r) => r.id === routeId) || NAV[0];
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
