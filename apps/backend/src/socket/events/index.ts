/**
 * Eventos Socket.io
 * Referencia: backend-plan §5
 *
 * Cliente → Servidor: cart:updated, product:scanned, scale:reading, etc.
 * Servidor → Kiosk: cart:sync, product:found, payment:status, etc.
 * Servidor → Operador: kiosk:connected, session:started, etc.
 */

export const CLIENT_EVENTS = {
  CART_UPDATED: 'cart:updated',
  PRODUCT_SCANNED: 'product:scanned',
  SCALE_READING: 'scale:reading',
  PAYMENT_COMPLETED: 'payment:completed',
  ASSISTANCE_REQUESTED: 'assistance:requested',
} as const;

export const KIOSK_EVENTS = {
  CART_SYNC: 'cart:sync',
  PRODUCT_FOUND: 'product:found',
  PRODUCT_NOT_FOUND: 'product:not-found',
  INVENTORY_UPDATE: 'inventory:update',
  PAYMENT_STATUS: 'payment:status',
  SESSION_TIMEOUT: 'session:timeout',
} as const;
