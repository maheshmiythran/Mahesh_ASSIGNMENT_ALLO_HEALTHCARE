import { z, ZodSchema } from 'zod';

// Reusable validation schemas
export const reservationSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
});

export const confirmReservationSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
});

export const releaseReservationSchema = z.object({
  reservationId: z.string().min(1, 'Reservation ID is required'),
});

// Validation utility function
export function validateRequest<T>(schema: ZodSchema, data: unknown): { success: true; data: T } | { success: false; error: string; details: unknown } {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: 'Validation failed',
      details: result.error.issues,
    };
  }

  return {
    success: true,
    data: result.data as T,
  };
}
