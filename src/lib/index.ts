/**
 * Centralized exports for all library utilities and services
 * This file makes it easy to import from @/lib without knowing the specific file names
 */

// Database
export { prisma } from './db';

// Constants
export {
  RESERVATION_EXPIRY_MINUTES,
  RESERVATION_EXPIRY_MS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './constants';

// Types
export type {
  ApiResponse,
  ReservationRequest,
  ReservationResponse,
  ProductInventory,
  ProductResponse,
  InventoryData,
  ErrorResponse,
} from './types';

// Logger
export { logger } from './logger';

// Validation
export {
  reservationSchema,
  confirmReservationSchema,
  releaseReservationSchema,
  validateRequest,
} from './validation';

// Error Handling
export {
  ApiError,
  createErrorResponse,
  createSuccessResponse,
  errorResponses,
} from './errors';

// Inventory Helpers
export {
  calculateAvailableQuantity,
  hasEnoughStock,
  calculateStockUtilization,
  isLowStock,
  getInventoryStatus,
} from './inventory-helpers';

// Services
export { ReservationService } from './reservation-service';
export { ProductService } from './product-service';
export type { WarehouseWithInventory } from './warehouse-service';
export { WarehouseService } from './warehouse-service';
