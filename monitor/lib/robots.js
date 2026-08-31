// Minimal robots.txt fetch + check, cached per-origin. Handles the common
// case (User-agent: * groups with Disallow/Allow path prefixes) — not the
// full spec, but enough to responsibly avoid paths a site has opted out of.
const USER_AGENT = 'GovBabuMonitorBot/0.1 (+https://govbabu.example/bot)';
const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map(); // origin -> { rules, fetchedAt }

function parseRobots(text) {
  const lines = text.split('\n').map((l) => l.trim());
  const groups = []; // { agents: [...], rules: [{type, path}] }
  let current = null;
  for (const raw of lines) {
    const line = raw.split('#')[0].trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === 'user-agent') {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if ((field === 'disallow' || field === 'allow') && current) {
      current.rules.push({ type: field, path: value });
    }
  }
  return groups;
}

function groupApplies(group, ua) {
  return group.agents.includes('*') || group.agents.some((a) => ua.toLowerCase().includes(a));
}

async function fetchRobots(origin) {
  const cached = cache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return cached.rules;
  let rules = [];
  try {
    const res = await fetch(origin + '/robots.txt', {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) rules = parseRobots(await res.text());
  } catch {
    rules = []; // unreachable robots.txt -> treat as "no restrictions declared"
  }
  cache.set(origin, { rules, fetchedAt: Date.now() });
  return rules;
}

async function isAllowed(url) {
  const u = new URL(url);
  const groups = await fetchRobots(u.origin);
  const applicable = groups.filter((g) => groupApplies(g, USER_AGENT));
  if (!applicable.length) return true;
  let allowed = true;
  let bestMatchLen = -1;
  for (const g of applicable) {
    for (const rule of g.rules) {
      if (!rule.path) continue;
      if (u.pathname.startsWith(rule.path) && rule.path.length > bestMatchLen) {
        bestMatchLen = rule.path.length;
        allowed = rule.type !== 'disallow';
      }
    }
  }
  return allowed;
}

module.exports = { isAllowed, USER_AGENT, parseRobots };
