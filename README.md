# Allo Inventory Reservation System

This is a student-style project built for the Allo Engineering take-home assignment. It is designed to show my skills as an entry-level internship candidate while keeping the app simple and easy to understand.

## What this project does

- Allows temporary reservations of product stock
- Prevents overselling when multiple users try to buy the same item
- Supports confirm and release actions for reservations
- Uses a PostgreSQL database with Prisma in a Next.js App Router app

## What I did in this project

- Built API routes for products, warehouses, and reservations
- Implemented reservation creation, confirmation, and release logic
- Added concurrency safety with row-level locking in Prisma
- Created database seed data for products and warehouses
- Handled reservation expiry and inventory release on access
- Wrote the app in TypeScript with clear service layer organization

## How to run locally

1. Install dependencies
   ```bash
   npm install
   ```

2. Add environment variables
   Create a `.env` file in the project root with:
   ```bash
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

3. Prepare the database
   ```bash
   npx prisma db push
   npm run seed
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open the app in your browser
   - http://localhost:3000

## What I learned

- Connecting Next.js to PostgreSQL using Prisma
- Basic inventory reservation logic
- Using row-level locking for concurrency safety
- Returning correct HTTP errors like `409 Conflict`
- Handling simple reservation expiry without extra infrastructure

## Key design choices

- I used a Prisma database transaction with `SELECT ... FOR UPDATE` to lock inventory rows.
- The app checks stock and updates reserved quantity inside the same transaction.
- If inventory is not enough, it returns `409 Conflict`.
- Reservations expire after 10 minutes using a lazy expiry check on access.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── products/
│   │   ├── reservations/
│   │   └── warehouses/
│   ├── reservation/
│   └── layout.tsx
├── lib/
│   ├── constants.ts
│   ├── db.ts
│   ├── errors.ts
│   ├── inventory-helpers.ts
│   ├── logger.ts
│   ├── product-service.ts
│   ├── reservation-service.ts
│   ├── validation.ts
│   ├── warehouse-service.ts
│   └── types.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## API endpoints

- `GET /api/products` — list products and inventory
- `GET /api/warehouses` — warehouse inventory summary
- `POST /api/reservations` — create a reservation
- `GET /api/reservations/[id]` — get reservation details
- `POST /api/reservations/[id]/confirm` — confirm a reservation
- `POST /api/reservations/[id]/release` — release a reservation

## Technologies used

- Next.js 16
- TypeScript
- Prisma 5
- PostgreSQL
- Zod

## Notes for reviewers

This README is written from the perspective of an entry-level intern candidate. My goal was to make the implementation clear, practical, and easy to follow for someone reviewing a student internship project.
