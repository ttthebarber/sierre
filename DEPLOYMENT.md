# Deployment Guide

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

### Clerk Authentication
```
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

### Supabase Database
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Shopify Integration
```
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_REDIRECT_URL=https://your-app.vercel.app/api/integrations/shopify/callback
```

### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Deployment Steps

1. **Push to GitHub**: Commit and push your code to a GitHub repository
2. **Connect to Vercel**: Import your repository in Vercel dashboard
3. **Set Environment Variables**: Add all the environment variables above
4. **Deploy**: Vercel will automatically deploy your app
5. **Update Shopify**: Update your Shopify app's redirect URL to your Vercel URL

## Shopify App Configuration

After deployment, update your Shopify Partner Dashboard:
- Go to your app → App setup
- Update "Allowed redirection URL(s)" to: `https://your-app.vercel.app/api/integrations/shopify/callback`

## Database Setup

Make sure your Supabase database has the required tables:
- `stores` - for connected Shopify stores
- `subscriptions` - for user subscription data
- `orders` - for order data (if using order tracking)

## Testing

After deployment:
1. Visit your Vercel app URL
2. Sign up/Sign in with Clerk
3. Try connecting a Shopify store
4. Verify the redirect works without SSL errors
