// Reservation constants
export const RESERVATION_EXPIRY_MINUTES = 10;
export const RESERVATION_EXPIRY_MS = RESERVATION_EXPIRY_MINUTES * 60 * 1000;

// API constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Error messages
export const ERROR_MESSAGES = {
  INVENTORY_NOT_FOUND: 'Inventory not found',
  NOT_ENOUGH_STOCK: 'Not enough stock available',
  INVALID_QUANTITY: 'Quantity must be a positive integer',
  INVALID_REQUEST: 'Invalid request body',
  RESERVATION_NOT_FOUND: 'Reservation not found',
  INVALID_RESERVATION_STATUS: 'Invalid reservation status',
  INTERNAL_ERROR: 'An internal server error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  RESERVATION_CREATED: 'Reservation created successfully',
  RESERVATION_CONFIRMED: 'Reservation confirmed successfully',
  RESERVATION_RELEASED: 'Reservation released successfully',
} as const;
