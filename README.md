# Allo Inventory Reservation System

This is my submission for the Allo Engineering Take-Home Exercise. It's a Next.js App Router application that handles temporary stock reservations during checkout, ensuring we don't oversell when multiple users try to buy the same item at the exact same time.

## How to run locally

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root based on `.env.example`:
   ```bash
   # Needs to be a real PostgreSQL database (e.g., Neon or Supabase)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

3. **Database Setup & Seeding**
   Push the schema to your database and run the seed script:
   ```bash
   npx prisma db push
   npm run seed
   ```
   *Note: The seed script creates 5 products, 2 warehouses, and varying inventory levels (including some low stock items specifically so you can test the 409 error easily).*

4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

For production deployment with a hosted PostgreSQL database:

**Quick Start:**
1. Set up a database with **Neon** or **Supabase** (free tier)
2. Deploy to **Vercel** (free tier)
3. Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed steps

**Key Points:**
- Uses Vercel for Next.js hosting
- PostgreSQL hosted on Neon or Supabase
- Optional Redis on Upstash for future enhancements
- Zero-cost for free tier deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions and troubleshooting.

## Architecture & Concurrency Strategy

The core challenge was making sure two users can't reserve the last unit at the exact same time.

I chose to handle this entirely inside PostgreSQL using **Row-Level Locking** via a Prisma transaction. 

When a reservation request comes in (`POST /api/reservations`), the system:
1. Opens a database transaction.
2. Runs a raw SQL query: `SELECT * FROM "Inventory" ... FOR UPDATE`. This locks the specific inventory row so no other concurrent request can read or modify it until this transaction finishes.
3. Checks if `totalQuantity - reservedQuantity >= requestedQuantity`.
4. If there's enough stock, it increments `reservedQuantity` and creates the `Reservation` record.
5. If not, it throws an error and returns a `409 Conflict`, which the frontend catches and displays to the user.

I went with this approach because it's reliable and doesn't require setting up Redis for distributed locks, keeping the architecture much simpler.

## Expiry Mechanism

Reservations expire after 10 minutes. I went with a **lazy expiration** approach.

Instead of running a background worker or cron job to constantly check for expired reservations, the system checks the expiry time whenever a reservation is accessed (like when a user tries to confirm or release it). 

If a `PENDING` reservation is past its `expiresAt` time, the API automatically flips it to `RELEASED`, decrements the `reservedQuantity` to free up the stock, and returns a `410 Gone` error. 

**Trade-off:** This means expired reservations might sit in the database as `PENDING` indefinitely if no one ever tries to interact with them again. For a real production system, I'd probably add a lightweight Vercel Cron job that hits a cleanup endpoint every 5 minutes to sweep these up, but lazy expiration handles the core correctness requirement nicely without extra infrastructure.

## Project Structure

```
src/
├── app/
│   ├── api/              # API route handlers
│   │   ├── products/     # Product endpoints
│   │   ├── reservations/ # Reservation endpoints (create, confirm, release)
│   │   └── warehouses/   # Warehouse endpoints
│   ├── reservation/      # Reservation UI pages
│   └── layout.tsx        # Main layout
├── lib/
│   ├── constants.ts          # Application constants
│   ├── types.ts              # TypeScript type definitions
│   ├── logger.ts             # Logging utility
│   ├── validation.ts         # Request validation schemas
│   ├── errors.ts             # Error handling utilities
│   ├── inventory-helpers.ts  # Inventory calculation helpers
│   ├── reservation-service.ts # Reservation business logic
│   ├── product-service.ts     # Product business logic
│   ├── warehouse-service.ts   # Warehouse business logic
│   └── db.ts                 # Prisma client
└── prisma/
    ├── schema.prisma        # Database schema
    └── seed.ts              # Database seed script
```

## API Endpoints

### Products
- `GET /api/products` - List all products with inventory across warehouses

### Reservations
- `POST /api/reservations` - Create a new reservation
  - Body: `{ productId, warehouseId, quantity }`
- `GET /api/reservations/[id]` - Get reservation details
- `POST /api/reservations/[id]/confirm` - Confirm a reservation
- `POST /api/reservations/[id]/release` - Release a reservation

### Warehouses
- `GET /api/warehouses` - List all warehouses with inventory summary

## Core Libraries & Technologies

- **Next.js 16** - React framework with App Router
- **Prisma 5** - Database ORM with type safety
- **PostgreSQL** - Primary database
- **Zod** - Runtime type validation
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Static type checking

## Service Layer Architecture

The application uses a service layer pattern (`*-service.ts` files) to encapsulate business logic:

- **ReservationService** - Handles reservation creation, confirmation, and release with row-level locking
- **ProductService** - Manages product queries and inventory aggregation
- **WarehouseService** - Handles warehouse queries and utilization calculations

Each service includes comprehensive logging for debugging and monitoring.


