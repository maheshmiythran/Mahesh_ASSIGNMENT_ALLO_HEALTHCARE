import { prisma } from './db';
import { ProductResponse, ProductInventory } from './types';
import { logger } from './logger';

/**
 * Service for handling product-related database operations
 */
export class ProductService {
  /**
   * Get all products with their inventory details
   */
  static async getAllProducts(): Promise<ProductResponse[]> {
    try {
      logger.debug('Fetching all products');

      const products = await prisma.product.findMany({
        include: {
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
      });

      const result: ProductResponse[] = products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        price: product.price,
        inventory: product.inventory.map((inv) => ({
          id: inv.id,
          warehouseId: inv.warehouseId,
          warehouseName: inv.warehouse.name,
          warehouseLocation: inv.warehouse.location,
          totalQuantity: inv.totalQuantity,
          reservedQuantity: inv.reservedQuantity,
          availableQuantity: inv.totalQuantity - inv.reservedQuantity,
        })),
      }));

      logger.info('Products fetched successfully', { count: result.length });
      return result;
    } catch (error) {
      logger.error('Failed to fetch products', { error });
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProductById(productId: string): Promise<ProductResponse | null> {
    try {
      logger.debug('Fetching product by ID', { productId });

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          inventory: {
            include: {
              warehouse: true,
            },
          },
        },
      });

      if (!product) {
        logger.warn('Product not found', { productId });
        return null;
      }

      const result: ProductResponse = {
        id: product.id,
        name: product.name,
        description: product.description || undefined,
        price: product.price,
        inventory: product.inventory.map((inv) => ({
          id: inv.id,
          warehouseId: inv.warehouseId,
          warehouseName: inv.warehouse.name,
          warehouseLocation: inv.warehouse.location,
          totalQuantity: inv.totalQuantity,
          reservedQuantity: inv.reservedQuantity,
          availableQuantity: inv.totalQuantity - inv.reservedQuantity,
        })),
      };

      return result;
    } catch (error) {
      logger.error('Failed to fetch product', { error, productId });
      throw error;
    }
  }

  /**
   * Get total inventory across all warehouses for a product
   */
  static async getTotalInventoryForProduct(
    productId: string,
  ): Promise<{ total: number; reserved: number; available: number } | null> {
    try {
      logger.debug('Calculating total inventory for product', { productId });

      const inventories = await prisma.inventory.findMany({
        where: { productId },
      });

      if (inventories.length === 0) {
        return null;
      }

      const total = inventories.reduce((sum, inv) => sum + inv.totalQuantity, 0);
      const reserved = inventories.reduce((sum, inv) => sum + inv.reservedQuantity, 0);

      return {
        total,
        reserved,
        available: total - reserved,
      };
    } catch (error) {
      logger.error('Failed to calculate total inventory', { error, productId });
      throw error;
    }
  }
}
