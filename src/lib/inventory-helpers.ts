import { InventoryData } from './types';

/**
 * Calculate available quantity for an inventory item
 * Available = Total - Reserved
 */
export function calculateAvailableQuantity(inventory: InventoryData): number {
  return inventory.totalQuantity - inventory.reservedQuantity;
}

/**
 * Check if there is enough available stock for a reservation
 */
export function hasEnoughStock(inventory: InventoryData, requestedQuantity: number): boolean {
  return calculateAvailableQuantity(inventory) >= requestedQuantity;
}

/**
 * Calculate the stock utilization percentage
 */
export function calculateStockUtilization(inventory: InventoryData): number {
  if (inventory.totalQuantity === 0) return 0;
  return (inventory.reservedQuantity / inventory.totalQuantity) * 100;
}

/**
 * Check if inventory is low stock (less than 10% available)
 */
export function isLowStock(inventory: InventoryData, threshold: number = 0.1): boolean {
  const availablePercentage = calculateAvailableQuantity(inventory) / inventory.totalQuantity;
  return availablePercentage < threshold;
}

/**
 * Get inventory status summary
 */
export function getInventoryStatus(inventory: InventoryData): 'out_of_stock' | 'low_stock' | 'in_stock' {
  const available = calculateAvailableQuantity(inventory);

  if (available === 0) {
    return 'out_of_stock';
  }

  if (isLowStock(inventory)) {
    return 'low_stock';
  }

  return 'in_stock';
}
