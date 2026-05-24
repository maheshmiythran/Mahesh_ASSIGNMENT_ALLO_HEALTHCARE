import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { inventory: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 });
    }

    // lazy expiry check
    if (reservation.expiresAt < new Date()) {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id },
          data: { status: 'RELEASED' },
        }),
        prisma.inventory.update({
          where: { id: reservation.inventoryId },
          data: { reservedQuantity: { decrement: reservation.quantity } },
        }),
      ]);

      return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 });
    }

    // confirm: move from reserved to consumed (decrement both)
    const [updatedReservation] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.inventory.update({
        where: { id: reservation.inventoryId },
        data: {
          reservedQuantity: { decrement: reservation.quantity },
          totalQuantity: { decrement: reservation.quantity },
        },
      }),
    ]);

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Failed to confirm reservation:', error);
    return NextResponse.json({ error: 'Failed to confirm reservation' }, { status: 500 });
  }
}
