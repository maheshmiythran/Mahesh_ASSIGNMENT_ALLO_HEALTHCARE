import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // clean up existing data in correct order
  await prisma.reservation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.product.deleteMany();

  console.log('Cleared existing data');

  // create products
  const thermometer = await prisma.product.create({
    data: {
      name: 'Digital Thermometer',
      description: 'Fast and accurate digital thermometer with LCD display',
      price: 499,
    },
  });

  const oximeter = await prisma.product.create({
    data: {
      name: 'Pulse Oximeter',
      description: 'Fingertip pulse oximeter with SpO2 and heart rate monitoring',
      price: 1299,
    },
  });

  const bpMonitor = await prisma.product.create({
    data: {
      name: 'Blood Pressure Monitor',
      description: 'Automatic upper arm blood pressure monitor with memory function',
      price: 1899,
    },
  });

  const firstAidKit = await prisma.product.create({
    data: {
      name: 'First Aid Kit',
      description: 'Comprehensive 100-piece first aid kit for home and travel',
      price: 799,
    },
  });

  const masks = await prisma.product.create({
    data: {
      name: 'N95 Masks (Box of 20)',
      description: 'NIOSH-approved N95 respirator masks, box of 20',
      price: 649,
    },
  });

  console.log('Created 5 products');

  // create warehouses
  const mumbai = await prisma.warehouse.create({
    data: {
      name: 'Mumbai Central Warehouse',
      location: 'Mumbai, Maharashtra',
    },
  });

  const delhi = await prisma.warehouse.create({
    data: {
      name: 'Delhi NCR Warehouse',
      location: 'Gurugram, Haryana',
    },
  });

  console.log('Created 2 warehouses');

  // create inventory entries - mix of high and low stock
  const inventoryData = [
    // Mumbai warehouse
    { productId: thermometer.id, warehouseId: mumbai.id, totalQuantity: 75 },
    { productId: oximeter.id, warehouseId: mumbai.id, totalQuantity: 50 },
    { productId: bpMonitor.id, warehouseId: mumbai.id, totalQuantity: 3 },  // low stock
    { productId: firstAidKit.id, warehouseId: mumbai.id, totalQuantity: 100 },
    { productId: masks.id, warehouseId: mumbai.id, totalQuantity: 2 },  // low stock

    // Delhi warehouse
    { productId: thermometer.id, warehouseId: delhi.id, totalQuantity: 60 },
    { productId: oximeter.id, warehouseId: delhi.id, totalQuantity: 2 },  // low stock
    { productId: bpMonitor.id, warehouseId: delhi.id, totalQuantity: 80 },
    { productId: firstAidKit.id, warehouseId: delhi.id, totalQuantity: 3 },  // low stock
    { productId: masks.id, warehouseId: delhi.id, totalQuantity: 90 },
  ];

  for (const entry of inventoryData) {
    await prisma.inventory.create({ data: entry });
  }

  console.log('Created inventory entries');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
