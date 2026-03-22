const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  get: <T>(path: string) => fetch(`${API_URL}${path}`).then((r) => r.json() as Promise<T>),
  post: <T>(path: string, body: unknown) =>
    fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),
};
