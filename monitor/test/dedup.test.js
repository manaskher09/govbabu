const test = require('node:test');
const assert = require('node:assert/strict');
const { runCheck } = require('../pipeline/runCheck');
const { createTestDb, seedExamWithSource, fakeFetcherReturning } = require('./helpers');

const noAi = async () => null;

function notifyCounter() {
  const calls = [];
  return { spy: { notifyDetectedChange: async (exam, change) => calls.push(change) }, calls };
}

function notice(examDate) {
  return `Date of Examination: ${examDate}. Total Number of Vacancies: 500 posts.`;
}

test('STEP 12: the same PDF checked repeatedly before approval creates exactly one pending change and one notification', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  const { spy, calls } = notifyCounter();

  // Simulate the government site serving byte-different-but-meaning-identical
  // content on every check (e.g. a rebuilt PDF with a fresh internal
  // timestamp) — 5 checks in a row, same candidate exam_date each time.
  for (let i = 0; i < 5; i++) {
    await runCheck(db, sourceId, {
      fetcher: fakeFetcherReturning(notice('22 November 2026') + ' '.repeat(i)), // forces a different byte hash each time
      aiAssist: noAi,
      notifications: spy,
    });
  }

  const pending = db.prepare("SELECT * FROM change_events WHERE status = 'pending' AND field_name = 'exam_date'").all();
  assert.equal(pending.length, 1, 'must not create 5 identical pending change_events');
  assert.equal(calls.filter((c) => c.field_name === 'exam_date').length, 1, 'must not send 5 identical alerts');
});

test('a genuinely different candidate value alongside repeats still gets exactly one queue entry per distinct value', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  const { spy } = notifyCounter();

  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice('22 November 2026')), aiAssist: noAi, notifications: spy });
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice('22 November 2026') + '  '), aiAssist: noAi, notifications: spy }); // repeat
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice('29 November 2026')), aiAssist: noAi, notifications: spy }); // genuinely new

  const pending = db.prepare("SELECT new_value FROM change_events WHERE status = 'pending' AND field_name = 'exam_date' ORDER BY id").all();
  assert.deepEqual(pending.map((p) => p.new_value), ['2026-11-22', '2026-11-29']);
});
