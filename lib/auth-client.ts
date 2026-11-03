const SESSION_STORAGE_KEY = 'session_id';

export function storeSessionId(sessionId: string) {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function clearSessionId() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const sessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (sessionId) {
    headers.set('x-session-id', sessionId);
  }

  return fetch(input, { ...init, headers });
}
