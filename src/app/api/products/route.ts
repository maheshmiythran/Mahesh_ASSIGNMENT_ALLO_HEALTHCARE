import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventory: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const result = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
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

    return Response.json(result);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
