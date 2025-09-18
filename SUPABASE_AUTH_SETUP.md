# Supabase Authentication Setup

## Email Confirmation Redirect URL

To fix the email confirmation redirect issue, you need to add the following URL to your Supabase project settings:

### 1. Go to Supabase Dashboard
- Navigate to your Supabase project
- Go to **Authentication** → **URL Configuration**

### 2. Add Redirect URL
Add this URL to the **Redirect URLs** list:
```
http://localhost:3000/auth/callback
```

For production, also add:
```
https://yourdomain.com/auth/callback
```

### 3. Save Changes
Click **Save** to apply the changes.

## How It Works

1. User signs up with email/password
2. Supabase sends confirmation email with link to `/auth/callback?code=...`
3. User clicks the link in their email
4. The `/auth/callback` route exchanges the code for a session
5. User is automatically redirected to `/dashboard`
6. User is now signed in and can access the app

## Testing

1. Sign up with a new email address
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should be automatically redirected to the dashboard and signed in

## Troubleshooting

If you still get redirected to the sign-in page:
1. Check that the redirect URL is added to Supabase settings
2. Make sure you're using the correct domain (localhost:3000 for dev)
3. Clear your browser cache and cookies
4. Check the browser console for any errors
