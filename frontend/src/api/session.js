export const portalForPath = (path) => /^\/admin(?:[-/]|$)/.test(path) ? 'admin' : 'applicant';
const key = (portal, field) => `smartloan:${portal}:${field}`;

export function getToken(portal = 'applicant') {
  return localStorage.getItem(key(portal, 'token'));
}

export function getUser(portal = 'applicant') {
  try { return JSON.parse(localStorage.getItem(key(portal, 'user')) || 'null'); }
  catch { return null; }
}

export function saveUser(portal, user) {
  localStorage.setItem(key(portal, 'user'), JSON.stringify(user));
}

export function saveSession(portal, user) {
  localStorage.setItem(key(portal, 'token'), user.access_token);
  saveUser(portal, user);
}

export function clearSession(portal) {
  localStorage.removeItem(key(portal, 'token'));
  localStorage.removeItem(key(portal, 'user'));
}

// Move an older shared login into only its own portal, never into both.
export function migrateSession() {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      const portal = user.role === 'admin' ? 'admin' : 'applicant';
      if (!getToken(portal)) saveSession(portal, { ...user, access_token: token });
    }
  } catch {
    // Invalid legacy data requires a fresh login.
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
