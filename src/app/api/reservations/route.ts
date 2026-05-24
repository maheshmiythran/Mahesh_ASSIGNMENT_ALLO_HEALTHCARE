import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const reservationSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body', details: parsed.error.issues }, { status: 400 });
    }

    const { productId, warehouseId, quantity } = parsed.data;

    const reservation = await prisma.$transaction(async (tx) => {
      // lock the inventory row to prevent race conditions
      const rows = await tx.$queryRaw<
        { id: string; totalQuantity: number; reservedQuantity: number }[]
      >`SELECT id, "totalQuantity", "reservedQuantity" FROM "Inventory" WHERE "productId" = ${productId} AND "warehouseId" = ${warehouseId} FOR UPDATE`;

      if (rows.length === 0) {
        throw new Error('Inventory not found');
      }

      const inv = rows[0];
      const available = inv.totalQuantity - inv.reservedQuantity;

      if (available < quantity) {
        throw new Error('Not enough stock available');
      }

      // update reserved quantity
      await tx.inventory.update({
        where: { id: inv.id },
        data: { reservedQuantity: { increment: quantity } },
      });

      // create reservation with 10 min expiry
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const newReservation = await tx.reservation.create({
        data: {
          quantity,
          inventoryId: inv.id,
          expiresAt,
        },
      });

      return newReservation;
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Something went wrong';

    if (message === 'Not enough stock available' || message === 'Inventory not found') {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error('Failed to create reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
