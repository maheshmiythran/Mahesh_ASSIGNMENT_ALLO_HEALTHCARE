import { prisma } from './db';
import { logger } from './logger';

export interface WarehouseWithInventory {
  id: string;
  name: string;
  location: string;
  totalProducts: number;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

/**
 * Service for handling warehouse-related database operations
 */
export class WarehouseService {
  /**
   * Get all warehouses with inventory summary
   */
  static async getAllWarehouses(): Promise<WarehouseWithInventory[]> {
    try {
      logger.debug('Fetching all warehouses');

      const warehouses = await prisma.warehouse.findMany({
        include: {
          inventory: true,
        },
      });

      const result: WarehouseWithInventory[] = warehouses.map((warehouse) => {
        const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.totalQuantity, 0);
        const reservedStock = warehouse.inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

        return {
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
          totalProducts: warehouse.inventory.length,
          totalStock,
          reservedStock,
          availableStock: totalStock - reservedStock,
        };
      });

      logger.info('Warehouses fetched successfully', { count: result.length });
      return result;
    } catch (error) {
      logger.error('Failed to fetch warehouses', { error });
      throw error;
    }
  }

  /**
   * Get a single warehouse with inventory details
   */
  static async getWarehouseById(warehouseId: string): Promise<WarehouseWithInventory | null> {
    try {
      logger.debug('Fetching warehouse by ID', { warehouseId });

      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: {
          inventory: true,
        },
      });

      if (!warehouse) {
        logger.warn('Warehouse not found', { warehouseId });
        return null;
      }

      const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.totalQuantity, 0);
      const reservedStock = warehouse.inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

      const result: WarehouseWithInventory = {
        id: warehouse.id,
        name: warehouse.name,
        location: warehouse.location,
        totalProducts: warehouse.inventory.length,
        totalStock,
        reservedStock,
        availableStock: totalStock - reservedStock,
      };

      return result;
    } catch (error) {
      logger.error('Failed to fetch warehouse', { error, warehouseId });
      throw error;
    }
  }

  /**
   * Get warehouse utilization percentage
   */
  static async getWarehouseUtilization(warehouseId: string): Promise<number | null> {
    try {
      logger.debug('Calculating warehouse utilization', { warehouseId });

      const warehouse = await prisma.warehouse.findUnique({
        where: { id: warehouseId },
        include: {
          inventory: true,
        },
      });

      if (!warehouse) {
        return null;
      }

      const totalStock = warehouse.inventory.reduce((sum, inv) => sum + inv.totalQuantity, 0);
      const reservedStock = warehouse.inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

      if (totalStock === 0) {
        return 0;
      }

      return (reservedStock / totalStock) * 100;
    } catch (error) {
      logger.error('Failed to calculate warehouse utilization', { error, warehouseId });
      throw error;
    }
  }
}
