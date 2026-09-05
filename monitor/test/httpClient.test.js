const test = require('node:test');
const assert = require('node:assert/strict');
const { dispatcherFor, RELAXED_TLS_HOSTS, isPrivateHostname, assertSafeUrl } = require('../lib/httpClient');

test('dispatcherFor returns the relaxed agent only for exact allowlisted hostnames', () => {
  for (const host of RELAXED_TLS_HOSTS) {
    assert.ok(dispatcherFor(host), `expected a relaxed dispatcher for ${host}`);
  }
});

test('dispatcherFor returns undefined (default verification) for any other hostname', () => {
  assert.equal(dispatcherFor('ssc.gov.in'), undefined);
  assert.equal(dispatcherFor('example.com'), undefined);
  assert.equal(dispatcherFor('evil.www.ibps.in.attacker.example'), undefined, 'must be an exact match, not a substring/suffix match');
});

test('dispatcherFor is not fooled by a subdomain of an allowlisted host', () => {
  assert.equal(dispatcherFor('sub.upsssc.gov.in'), undefined);
});

test('the relaxed-TLS allowlist does not overlap with the private-address guard — it is not a way to reach internal hosts', () => {
  for (const host of RELAXED_TLS_HOSTS) {
    assert.equal(isPrivateHostname(host), false);
  }
});

test('assertSafeUrl still rejects a private address even for an allowlisted-looking scheme', () => {
  assert.throws(() => assertSafeUrl('http://127.0.0.1/x'), /refused_private_address/);
});
