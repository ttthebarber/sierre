# Quick Fix for Email Confirmation Issues

## Option 1: Disable Email Confirmation (For Testing Only)

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/zbwreyfltocaegzgixix
   - Go to **Authentication** → **Settings** → **Auth**

2. **Disable Email Confirmation:**
   - Find "Enable email confirmations"
   - **Turn OFF** this setting
   - Save changes

3. **Test:**
   - Users can now sign up and immediately sign in
   - No confirmation emails required

⚠️ **Warning:** This is only for testing. For production, you should configure proper SMTP.

## Option 2: Configure Gmail SMTP (Recommended for Production)

1. **Prepare Gmail:**
   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)

2. **Configure Supabase:**
   - Go to **Authentication** → **Settings** → **Email**
   - Enable "Custom SMTP"
   - **SMTP Host:** `smtp.gmail.com`
   - **SMTP Port:** `587`
   - **SMTP User:** your-gmail@gmail.com
   - **SMTP Pass:** your-app-password (16 characters)
   - **SMTP Admin Email:** your-gmail@gmail.com
   - **SMTP Sender Name:** "Sierre"

3. **Add Redirect URLs:**
   - Go to **Authentication** → **URL Configuration**
   - Add: `http://localhost:3000/auth/callback`
   - Add: `https://sierre.vercel.app/auth/callback`

## Option 3: Use a Different Email Provider

### SendGrid (Free tier available):
- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- SMTP User: `apikey`
- SMTP Pass: Your SendGrid API key

### Mailgun (Free tier available):
- SMTP Host: `smtp.mailgun.org`
- SMTP Port: `587`
- SMTP User: Your Mailgun SMTP username
- SMTP Pass: Your Mailgun SMTP password

## Testing Your Fix

1. **Run the test script:**
   ```bash
   node test-auth-fix.js
   ```

2. **Check your email for confirmation link**

3. **After confirming, test sign in:**
   ```bash
   node test-auth-fix.js signin
   ```

## Common Issues

- **"Email not confirmed" error:** User needs to click confirmation link
- **No email received:** Check spam folder, configure SMTP
- **"Invalid credentials" after confirmation:** Clear browser cache/cookies
- **Redirect loop:** Make sure redirect URLs are properly configured
