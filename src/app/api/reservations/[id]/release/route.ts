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
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Reservation is not pending' }, { status: 400 });
    }

    const [updatedReservation] = await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: 'RELEASED' },
      }),
      prisma.inventory.update({
        where: { id: reservation.inventoryId },
        data: { reservedQuantity: { decrement: reservation.quantity } },
      }),
    ]);

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Failed to release reservation:', error);
    return NextResponse.json({ error: 'Failed to release reservation' }, { status: 500 });
  }
}
