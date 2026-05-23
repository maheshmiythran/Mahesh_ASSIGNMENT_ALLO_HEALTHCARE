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

## Other Trade-offs & Future Improvements

- **No Redis / Idempotency:** I skipped the bonus idempotency requirement. While I know it's important for payment webhooks, I wanted to focus on getting the core concurrency right. If I had more time, I'd add Redis (Upstash) to store `Idempotency-Key` headers for 24 hours to prevent duplicate confirm/release actions.
- **Raw SQL in Prisma:** Prisma doesn't natively support `SELECT FOR UPDATE`, which is why I had to use `$queryRaw` inside the transaction. It's a bit ugly but it's the standard workaround for this in the Prisma ecosystem.
- **UI/UX:** The frontend is just functional using Tailwind. I didn't spend time making it look like a polished consumer app since the focus was backend correctness.
- **Tests:** There are no automated tests. In a real scenario, I'd at least write some integration tests for the reservation endpoint using something like Jest or Vitest to pound it with concurrent requests and verify exactly one succeeds.
