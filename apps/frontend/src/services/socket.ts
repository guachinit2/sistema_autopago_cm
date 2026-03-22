const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

export function createSocketConnection() {
  return { url: SOCKET_URL };
}
