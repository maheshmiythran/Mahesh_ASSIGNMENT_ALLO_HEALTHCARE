import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            product: true,
            warehouse: true,
          },
        },
      },
    });

    if (!reservation) {
      return Response.json({ error: "Reservation not found" }, { status: 404 });
    }

    return Response.json(reservation);
  } catch (error) {
    console.error("Failed to fetch reservation:", error);
    return Response.json({ error: "Failed to fetch reservation" }, { status: 500 });
  }
}
