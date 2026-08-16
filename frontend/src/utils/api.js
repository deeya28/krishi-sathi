const BASE_URL = 'http://localhost:8000/api';

/** Read JWT token from the stored session */
export function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('ks_session'));
    return session?.token || null;
  } catch {
    return null;
  }
}

/**
 * Central fetch wrapper.
 * - Automatically attaches Content-Type and Authorization headers.
 * - Skips Content-Type when the body is FormData (file uploads) - the browser
 *   sets its own multipart/form-data boundary automatically, and setting it
 *   manually would break the upload.
 * - Throws an Error with the server's message if the response is not ok.
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}