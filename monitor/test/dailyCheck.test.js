const test = require('node:test');
const assert = require('node:assert/strict');
const { classify } = require('../bin/daily-check');

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
