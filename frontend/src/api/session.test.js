import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { clearSession, getToken, migrateSession, portalForPath, saveSession } from './session.js';
beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
  };
});
test('simultaneous accounts and independent logout in both directions', () => {
  saveSession('applicant', { access_token: 'a' });
  saveSession('admin', { access_token: 'b' });
  assert.equal(getToken('applicant'), 'a');
  clearSession('applicant');
  assert.equal(getToken('admin'), 'b');
  saveSession('applicant', { access_token: 'c' });
  clearSession('admin');
  assert.equal(getToken('applicant'), 'c');
});
test('each portal selects its own session', () => {
  for (const path of ['/admin-login', '/admin-dashboard', '/admin/application/1']) assert.equal(portalForPath(path), 'admin');
  for (const path of ['/', '/dashboard', '/apply-loan', '/loan-history']) assert.equal(portalForPath(path), 'applicant');
});
test('legacy admin migration never overwrites new session or signs applicant in', () => {
  saveSession('admin', { access_token: 'new' });
  localStorage.setItem('token', 'old');
  localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
  migrateSession();
  assert.equal(getToken('admin'), 'new');
  assert.equal(getToken('applicant'), null);
  assert.equal(localStorage.getItem('token'), null);
});
test('invalid old session does not crash login page', () => {
  localStorage.setItem('token', 'old');
  localStorage.setItem('user', '{');
  assert.doesNotThrow(migrateSession);
});
