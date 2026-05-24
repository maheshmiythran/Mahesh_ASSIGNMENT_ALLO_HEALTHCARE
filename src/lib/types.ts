// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Reservation Types
export interface ReservationRequest {
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface ReservationResponse {
  id: string;
  quantity: number;
  status: string;
  expiresAt: string;
  inventoryId: string;
  createdAt: string;
}

// Product Types
export interface ProductInventory {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  inventory: ProductInventory[];
}

// Inventory Types
export interface InventoryData {
  id: string;
  totalQuantity: number;
  reservedQuantity: number;
}

// Error Types
export interface ErrorResponse {
  error: string;
  details?: unknown;
  timestamp?: string;
}
