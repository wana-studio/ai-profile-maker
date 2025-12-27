---
description: Deploy the application to Vercel
---

# Deploy to Vercel

This workflow guides you through deploying your Next.js application to Vercel.

## Prerequisites

1. Ensure you have a [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI globally (if not already installed):
   ```bash
   npm install -g vercel
   ```

## Deployment Steps

### 1. Login to Vercel

// turbo
```bash
vercel login
```

Follow the prompts to authenticate with your Vercel account.

### 2. Initialize Vercel Project

// turbo
```bash
vercel
```

This command will:
- Link your local project to Vercel
- Ask you to confirm the project settings
- Deploy to a preview environment

Answer the prompts:
- **Set up and deploy**: `Y`
- **Which scope**: Choose your account/team
- **Link to existing project**: `N` (if first time) or `Y` (if already created)
- **Project name**: Accept default or provide custom name
- **Directory**: `.` (current directory)
- **Override settings**: `N` (use detected settings)

### 3. Configure Environment Variables

After the initial deployment, you need to add your environment variables to Vercel:

#### Option A: Via Vercel CLI (Recommended)
```bash
# Database
vercel env add DATABASE_URL production

# Clerk Authentication
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
vercel env add CLERK_WEBHOOK_SECRET production

# Clerk URLs (these can be the same for all environments)
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production

# Stripe
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRO_PRICE_ID production

# Replicate AI
vercel env add REPLICATE_API_TOKEN production

# Cloudflare R2 (S3-compatible storage)
vercel env add S3_ENDPOINT production
vercel env add S3_ACCESS_KEY_ID production
vercel env add S3_SECRET_ACCESS_KEY production
vercel env add S3_BUCKET_NAME production
vercel env add S3_API production
vercel env add S3_CUSTOM_DOMAIN production

# App URL (update this with your actual Vercel domain)
vercel env add NEXT_PUBLIC_APP_URL production
```

For each command, you'll be prompted to enter the value. Paste the value from your `.env` file.

#### Option B: Via Vercel Dashboard
1. Go to your project on https://vercel.com
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from your `env.example` file
4. Make sure to add them for the **Production** environment

### 4. Update Webhook URLs

After deployment, you'll need to update webhook URLs in external services:

#### Clerk Webhooks
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks**
4. Update the endpoint URL to: `https://your-domain.vercel.app/api/webhooks/clerk`
5. Update the `CLERK_WEBHOOK_SECRET` in Vercel if it changes

#### Stripe Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Update the endpoint URL to: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Update the `STRIPE_WEBHOOK_SECRET` in Vercel with the new signing secret

### 5. Update App URL Environment Variable

Update the `NEXT_PUBLIC_APP_URL` to your production domain:
```bash
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-domain.vercel.app
```

### 6. Deploy to Production

// turbo
```bash
vercel --prod
```

This will deploy your application to production.

### 7. Verify Deployment

1. Visit your production URL
2. Test authentication (sign up/sign in)
3. Verify all features are working:
   - User profile creation
   - Image generation
   - Payment processing
   - File uploads to R2

## Post-Deployment

### Database Migrations

If you need to run database migrations, you can do this locally with your production database:

```bash
npm run db:push
# or
npx drizzle-kit push
```

**⚠️ Warning**: Be careful when running migrations against production databases. Always backup first!

### Monitoring

- Check the **Vercel Dashboard** for deployment logs and analytics
- Monitor **Clerk Dashboard** for authentication metrics
- Monitor **Stripe Dashboard** for payment activity

## Troubleshooting

### Build Failures
- Check the build logs in Vercel Dashboard
- Ensure all environment variables are set correctly
- Verify that your `package.json` scripts are correct

### Runtime Errors
- Check the **Functions** tab in Vercel Dashboard for serverless function logs
- Enable Vercel Analytics for better insights
- Check external service dashboards (Clerk, Stripe, Replicate, R2) for errors

### Environment Variable Issues
- Ensure all required variables are set for the **Production** environment
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Redeploy after changing environment variables

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. **Connect Git Repository** (if not already done):
   - Go to your Vercel project settings
   - Connect to GitHub/GitLab/Bitbucket
   - Select your repository

2. **Automatic Deployments**:
   - Push to `main`/`master` branch → deploys to production
   - Push to other branches → creates preview deployments

## Custom Domain (Optional)

To add a custom domain:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_APP_URL` environment variable
6. Update webhook URLs in Clerk and Stripe
