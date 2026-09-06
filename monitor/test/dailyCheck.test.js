const test = require('node:test');
const assert = require('node:assert/strict');
const { classify, alertOnCrash } = require('../bin/daily-check');

test('classify: no_change, unavailable, and error map straight through', () => {
  assert.equal(classify({ result: 'no_change' }), 'noChange');
  assert.equal(classify({ result: 'unavailable' }), 'unavailable');
  assert.equal(classify({ result: 'error' }), 'errors');
});

test('classify: a manual-review-routed change (no changes[] array) is needsReview', () => {
  assert.equal(classify({ result: 'changed', classification: 'NEEDS_HUMAN_REVIEW', changeEventIds: [1] }), 'needsReview');
});

test('classify: a changes[] batch containing any NEEDS_HUMAN_REVIEW item is needsReview overall', () => {
  const result = {
    result: 'changed',
    changes: [{ classification: 'CONFIRMED_CHANGE' }, { classification: 'NEEDS_HUMAN_REVIEW' }],
  };
  assert.equal(classify(result), 'needsReview');
});

test('classify: a changes[] batch with only CONFIRMED_CHANGE items is changed', () => {
  const result = { result: 'changed', changes: [{ classification: 'CONFIRMED_CHANGE' }] };
  assert.equal(classify(result), 'changed');
});

test('alertOnCrash sends a Telegram alert when configured, and reports success', async () => {
  let sentMessage;
  const fakeTelegram = {
    isConfigured: () => true,
    sendAdmin: async (message) => { sentMessage = message; return { status: 'sent' }; },
  };
  const sent = await alertOnCrash(new Error('database is corrupt'), { telegram: fakeTelegram });
  assert.equal(sent, true);
  assert.match(sentMessage, /CRASHED/);
  assert.match(sentMessage, /database is corrupt/);
});

test('alertOnCrash reports false (not sent) when Telegram is not configured, without throwing', async () => {
  const fakeTelegram = { isConfigured: () => false, sendAdmin: async () => { throw new Error('should not be called'); } };
  const sent = await alertOnCrash(new Error('boom'), { telegram: fakeTelegram });
  assert.equal(sent, false);
});

test('alertOnCrash swallows a failure in the alert itself rather than throwing on top of the original crash', async () => {
  const fakeTelegram = { isConfigured: () => true, sendAdmin: async () => { throw new Error('telegram is down too'); } };
  const sent = await alertOnCrash(new Error('original crash'), { telegram: fakeTelegram });
  assert.equal(sent, false);
});
