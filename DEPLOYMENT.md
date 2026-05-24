# Deployment Guide for Vercel

This guide covers deploying the Allo Inventory Reservation System to Vercel with a hosted PostgreSQL database.

## Architecture Overview

For production deployment, we use:
- **Vercel** - Next.js app hosting (free tier available)
- **Neon** or **Supabase** - Hosted PostgreSQL database (free tier available)
- **Upstash** - Optional Redis cache (free tier available for future idempotency features)

## Prerequisites

1. GitHub account with the repository pushed
2. Vercel account (free tier)
3. Neon or Supabase account (free tier)
4. Node.js 18+ installed locally

## Step 1: Set Up Hosted Database

### Option A: Neon (Recommended for simplicity)

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub
3. Create a new project (e.g., "allo-healthcare")
4. Get your connection string from the "Connection String" tab
5. Copy the PostgreSQL connection string (it will look like):
   ```
   postgresql://[user]:[password]@[host].[region].neon.tech:5432/[database]?sslmode=require
   ```

### Option B: Supabase (Alternative)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create a new project (select Free plan)
4. Go to Settings → Database → Connection strings
5. Copy the "URI" (the PostgreSQL connection string)

## Step 2: Local Database Setup (Before Deploying)

Before deploying to Vercel, test your database connection locally:

1. Copy your database connection string
2. Create a `.env.local` file in your project root:
   ```bash
   DATABASE_URL="your-connection-string-here"
   ```

3. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```

4. Seed the database with test data:
   ```bash
   npm run seed
   ```

5. Verify the setup works locally:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 and test the products and reservations endpoints.

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Quickest)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. In your project directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Link to existing project or create new one
   - Select "Next.js" framework preset
   - Deploy

4. After deployment, add environment variables:
   ```bash
   vercel env add DATABASE_URL
   # Paste your database connection string when prompted
   ```

5. Redeploy to apply environment variables:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Web Dashboard

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select framework: **Next.js**
5. In "Environment Variables" section, add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
6. Click "Deploy"

## Step 4: Initialize Database on Vercel

After deployment, you need to set up the database on Vercel:

1. Go to your Vercel project dashboard
2. Click the "Deployments" tab
3. Click the latest deployment to view it
4. Open the deployment URL in your browser
5. The app should load (if it doesn't, check the build logs)

6. Run database migrations via Vercel CLI:
   ```bash
   vercel env pull  # Downloads your Vercel environment variables locally
   npx prisma db push  # Applies schema to production database
   npm run seed  # Seeds production database with test data
   ```

   Or if using `ts-node`:
   ```bash
   NODE_ENV=production DATABASE_URL="your-production-db-url" npx ts-node prisma/seed.ts
   ```

## Step 5: Verify Deployment

Test your deployed application:

```bash
# Test the products endpoint
curl https://your-vercel-app.vercel.app/api/products

# Test creating a reservation
curl -X POST https://your-vercel-app.vercel.app/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "your-product-id",
    "warehouseId": "your-warehouse-id",
    "quantity": 1
  }'
```

## Step 6: Configure Custom Domain (Optional)

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your custom domain (e.g., `allo.yourcompany.com`)
4. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | Yes | `postgresql://...` | PostgreSQL connection string |
| `NODE_ENV` | No | `production` | Set automatically by Vercel |

## Troubleshooting

### Database Connection Issues

**Error: "Unable to connect to database"**
- Verify DATABASE_URL is correct in Vercel environment variables
- Check if database IP whitelist includes Vercel's IPs (usually auto-enabled on cloud DBs)
- Test connection locally: `npx prisma db execute --stdin < /dev/null`

### Prisma Client Generation

**Error: "Prisma Client not found"**
- The build should auto-generate Prisma Client
- Check Vercel build logs for errors
- Manually trigger rebuild: Vercel Dashboard → Deployments → Re-deploy

### Database Already Exists

**Error: "Database already exists"** when running `prisma db push`
- This is normal if you already seeded it
- Skip the `db push` step if database is already set up

### Seed Script Fails

**Error during `npm run seed`**
- Ensure all environment variables are set correctly
- Check that the database schema was successfully applied
- Review seed.ts for any product/warehouse IDs that might conflict

## Monitoring & Logs

View real-time logs from your Vercel deployment:

```bash
vercel logs
```

For more detailed debugging:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Select "Runtime Logs" or "Build Logs"

## Updating Your Application

To deploy updates:

```bash
# If using Vercel CLI
git push origin main
vercel --prod

# If using GitHub integration
# Simply push to main/master branch - Vercel auto-deploys
```

If you modified the Prisma schema:

```bash
# Apply schema changes to production
npx prisma db push
```

## Cost Breakdown (Free Tier)

- **Vercel**: Free plan includes 100GB bandwidth/month
- **Neon/Supabase**: Free plan includes 500MB storage
- **Total**: $0/month for free tier (sufficient for development/testing)

Scale to paid plans only when needed (Vercel Pro: $20/month, Neon Pro: $15+/month).

## Next Steps

1. Set up monitoring (Vercel Analytics, Sentry, etc.)
2. Configure error tracking
3. Set up automated backups for your database
4. Consider implementing Redis for idempotency (future enhancement)
5. Add more comprehensive logging

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/deploy)
