import { prisma } from './db';
import { RESERVATION_EXPIRY_MS, ERROR_MESSAGES } from './constants';
import { InventoryData } from './types';
import { logger } from './logger';

/**
 * Service for handling reservation-related database operations
 */
export class ReservationService {
  /**
   * Create a new reservation with row-level locking to prevent race conditions
   */
  static async createReservation(productId: string, warehouseId: string, quantity: number) {
    try {
      logger.debug('Creating reservation', { productId, warehouseId, quantity });

      const reservation = await prisma.$transaction(async (tx) => {
        // Lock the inventory row to prevent concurrent modifications
        const rows = await tx.$queryRaw<InventoryData[]>`
          SELECT id, "totalQuantity", "reservedQuantity" 
          FROM "Inventory" 
          WHERE "productId" = ${productId} AND "warehouseId" = ${warehouseId} 
          FOR UPDATE
        `;

        if (rows.length === 0) {
          throw new Error(ERROR_MESSAGES.INVENTORY_NOT_FOUND);
        }

        const inventory = rows[0];
        const available = inventory.totalQuantity - inventory.reservedQuantity;

        if (available < quantity) {
          throw new Error(ERROR_MESSAGES.NOT_ENOUGH_STOCK);
        }

        // Update reserved quantity
        await tx.inventory.update({
          where: { id: inventory.id },
          data: { reservedQuantity: { increment: quantity } },
        });

        // Create reservation with expiry
        const expiresAt = new Date(Date.now() + RESERVATION_EXPIRY_MS);

        const newReservation = await tx.reservation.create({
          data: {
            quantity,
            inventoryId: inventory.id,
            expiresAt,
          },
        });

        return newReservation;
      });

      logger.info('Reservation created successfully', { reservationId: reservation.id });
      return reservation;
    } catch (error) {
      logger.error('Failed to create reservation', { error, productId, warehouseId, quantity });
      throw error;
    }
  }

  /**
   * Get a reservation by ID
   */
  static async getReservation(reservationId: string) {
    try {
      const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      });

      return reservation;
    } catch (error) {
      logger.error('Failed to fetch reservation', { error, reservationId });
      throw error;
    }
  }

  /**
   * Confirm a reservation (mark as CONFIRMED)
   */
  static async confirmReservation(reservationId: string) {
    try {
      logger.debug('Confirming reservation', { reservationId });

      const reservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: 'CONFIRMED' },
      });

      logger.info('Reservation confirmed', { reservationId });
      return reservation;
    } catch (error) {
      logger.error('Failed to confirm reservation', { error, reservationId });
      throw error;
    }
  }

  /**
   * Release a reservation (mark as RELEASED and free up reserved quantity)
   */
  static async releaseReservation(reservationId: string) {
    try {
      logger.debug('Releasing reservation', { reservationId });

      const result = await prisma.$transaction(async (tx) => {
        const reservation = await tx.reservation.findUnique({
          where: { id: reservationId },
        });

        if (!reservation) {
          throw new Error(ERROR_MESSAGES.RESERVATION_NOT_FOUND);
        }

        // Update reservation status
        const updatedReservation = await tx.reservation.update({
          where: { id: reservationId },
          data: { status: 'RELEASED' },
        });

        // Decrement reserved quantity
        await tx.inventory.update({
          where: { id: reservation.inventoryId },
          data: { reservedQuantity: { decrement: reservation.quantity } },
        });

        return updatedReservation;
      });

      logger.info('Reservation released', { reservationId });
      return result;
    } catch (error) {
      logger.error('Failed to release reservation', { error, reservationId });
      throw error;
    }
  }

  /**
   * Clean up expired reservations
   */
  static async cleanupExpiredReservations() {
    try {
      logger.debug('Starting expired reservation cleanup');

      const result = await prisma.$transaction(async (tx) => {
        const expiredReservations = await tx.reservation.findMany({
          where: {
            status: 'PENDING',
            expiresAt: {
              lt: new Date(),
            },
          },
        });

        if (expiredReservations.length === 0) {
          return { cleaned: 0 };
        }

        // Release all expired reservations
        for (const reservation of expiredReservations) {
          await tx.inventory.update({
            where: { id: reservation.inventoryId },
            data: { reservedQuantity: { decrement: reservation.quantity } },
          });

          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: 'RELEASED' },
          });
        }

        return { cleaned: expiredReservations.length };
      });

      logger.info('Expired reservation cleanup completed', result);
      return result;
    } catch (error) {
      logger.error('Failed to cleanup expired reservations', { error });
      throw error;
    }
  }
}
