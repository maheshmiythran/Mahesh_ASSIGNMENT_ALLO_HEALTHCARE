# Vercel & Database Setup Quick Checklist

Follow this checklist to deploy your application to Vercel with a hosted database.

## Phase 1: Set Up Hosted Database (5-10 minutes)

### Choose Your Database Provider

**Option A: Neon (Recommended)**
- [ ] Go to https://console.neon.tech
- [ ] Click "Sign Up" → "Continue with GitHub"
- [ ] Authorize the Neon app
- [ ] Create a new project (name: `allo-healthcare`)
- [ ] Wait for project to initialize
- [ ] Click "SQL Editor" or "Connection String"
- [ ] Copy the PostgreSQL connection string (looks like: `postgresql://[user]:[password]@[host]:5432/[db]?sslmode=require`)
- [ ] Save it somewhere safe (you'll need it soon)

**Option B: Supabase (Alternative)**
- [ ] Go to https://supabase.com
- [ ] Click "Start your project" → "Continue with GitHub"
- [ ] Create a new project (select Free plan, any region)
- [ ] Wait for project to initialize
- [ ] Go to Settings → Database → Connection Strings
- [ ] Copy the PostgreSQL URI
- [ ] Save it somewhere safe

## Phase 2: Test Locally with Your Database (10-15 minutes)

- [ ] Open your project in VS Code
- [ ] Create a `.env.local` file in the root directory
- [ ] Paste this content:
  ```
  DATABASE_URL="YOUR_CONNECTION_STRING_HERE"
  ```
- [ ] Replace `YOUR_CONNECTION_STRING_HERE` with your database URL from Phase 1
- [ ] Run: `npm install` (if you haven't already)
- [ ] Run: `npm run db:push` to push the schema to your hosted database
- [ ] Run: `npm run seed` to seed test data
- [ ] Run: `npm run dev` to start the local dev server
- [ ] Visit http://localhost:3000 in your browser
- [ ] Test the products page - you should see sample products
- [ ] Test the API: http://localhost:3000/api/products (should return JSON)
- [ ] If everything works, you're ready for Vercel!

## Phase 3: Deploy to Vercel (5-10 minutes)

### Option A: Using Vercel CLI (Easiest)

- [ ] Run: `npm install -g vercel` (if you don't have it installed)
- [ ] In your project directory, run: `vercel`
- [ ] Follow the prompts:
  - Link to existing Vercel account or create new one
  - Select current directory as project
  - Select "Next.js" as framework
  - Keep defaults for other options
- [ ] After deployment completes, you'll get a URL like: `https://your-project.vercel.app`
- [ ] Open that URL - if you see errors, continue to next step

### Option B: Using Vercel Web Dashboard

- [ ] Go to https://vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Choose "Import Git Repository"
- [ ] Select your GitHub repository
- [ ] Click "Import"
- [ ] In the "Environment Variables" section:
  - [ ] Click "Add New"
  - [ ] Name: `DATABASE_URL`
  - [ ] Value: Your database connection string from Phase 1
  - [ ] Click "Add"
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Click the deployment URL to view your app

## Phase 4: Initialize Database on Vercel (5 minutes)

After deploying to Vercel, you need to set up the database:

**Using Vercel CLI:**
```bash
vercel env pull                    # Download environment variables
npx prisma db push               # Push schema to production database
npm run seed                      # Seed production database
```

**Manually:**
- [ ] Get your production database URL from Vercel environment variables
- [ ] In terminal, set: `set DATABASE_URL=your_production_url` (Windows) or `export DATABASE_URL=...` (Mac/Linux)
- [ ] Run: `npx prisma db push`
- [ ] Run: `npm run seed`

## Phase 5: Verify Everything Works (5 minutes)

- [ ] Go to your Vercel app URL
- [ ] You should see the Products page
- [ ] Click on any product to view its inventory
- [ ] Try to create a reservation to test the API
- [ ] If it works, you're done! 🎉

## Phase 6: Configure Custom Domain (Optional, 5 minutes)

- [ ] Go to your Vercel project dashboard
- [ ] Click "Settings" → "Domains"
- [ ] Enter your custom domain (e.g., `allo.yourcompany.com`)
- [ ] Follow the DNS configuration instructions
- [ ] Wait for DNS to propagate (can take 24 hours)

## Troubleshooting

**"Connection refused" error:**
- Make sure your database connection string is correct
- Verify DATABASE_URL is set in Vercel environment variables
- Check that the database IP whitelist includes Vercel's IPs

**"Prisma Client not found" error:**
- The build should auto-generate it, but try:
  ```bash
  npm run db:generate
  vercel redeploy --prod
  ```

**"No products showing" on the UI:**
- Run the seed script again: `npm run seed`
- Check that your database was actually seeded by running:
  ```bash
  npx prisma studio  # Opens a GUI database browser
  ```

**Database already has data:**
- That's fine! The seed script is idempotent

**Can't connect to database locally:**
- Verify your `.env.local` file has the correct URL
- Check that your IP address is whitelisted (usually auto-enabled on cloud DBs)

## Cost Summary

| Service | Free Tier | Price When Scaling |
|---------|-----------|-------------------|
| Vercel | 100GB bandwidth/mo | $20/month (Pro) |
| Neon | 500MB storage | $15/month+ |
| Supabase | 500MB storage | $25/month+ |
| **Total** | **$0/month** | **Starting at $40/month** |

## Next Steps

- [ ] Monitor your app at vercel.com/dashboard
- [ ] Set up error tracking (optional): https://sentry.io
- [ ] Review logs: `vercel logs`
- [ ] Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed information
- [ ] Consider adding Redis for enhanced features (Upstash: free tier available)

## Quick Command Reference

```bash
# Local development
npm run dev                 # Start dev server
npm run seed               # Seed database
npm run db:push            # Push schema changes

# Deployment with CLI
vercel                     # Deploy to preview
vercel --prod              # Deploy to production
vercel logs                # View deployment logs

# Debugging
npx prisma studio         # Visual database browser
npm run lint              # Check for errors
npm run build             # Test production build locally
```

## Need Help?

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting
2. Vercel Docs: https://vercel.com/docs
3. Neon Docs: https://neon.tech/docs
4. Supabase Docs: https://supabase.com/docs
5. Prisma Docs: https://www.prisma.io/docs
