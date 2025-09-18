# Production-Ready Authentication Setup Guide

## 🎯 Overview
This guide will set up a complete, production-ready authentication system with:
- ✅ Reliable email delivery (Gmail SMTP)
- ✅ Proper redirect URLs for all environments
- ✅ Email confirmation resend functionality
- ✅ Password reset functionality
- ✅ Comprehensive error handling
- ✅ User-friendly feedback messages

## 📧 Step 1: Configure Gmail SMTP (Production Email Provider)

### 1.1 Prepare Your Gmail Account
1. **Enable 2-Factor Authentication:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and your device
   - Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)

### 1.2 Configure Supabase SMTP
1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/zbwreyfltocaegzgixix
   - Go to **Authentication** → **Settings** → **Email**

2. **Configure SMTP Settings:**
   ```
   ✅ Enable custom SMTP: ON
   📧 SMTP Host: smtp.gmail.com
   🔌 SMTP Port: 587
   👤 SMTP User: your-email@gmail.com
   🔑 SMTP Pass: your-16-char-app-password
   📨 SMTP Admin Email: your-email@gmail.com
   🏷️ SMTP Sender Name: Sierre
   ```

3. **Save Configuration**

## 🔗 Step 2: Configure Redirect URLs

### 2.1 Add Redirect URLs to Supabase
1. **Go to Authentication → URL Configuration**
2. **Add these URLs to "Redirect URLs":**
   ```
   http://localhost:3000/auth/callback
   https://sierre.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```

### 2.2 Add Site URL
1. **In the same section, set "Site URL":**
   ```
   https://sierre.vercel.app
   ```

## 📝 Step 3: Customize Email Templates

### 3.1 Confirmation Email Template
1. **Go to Authentication → Email Templates**
2. **Select "Confirm signup"**
3. **Update the template:**
   ```html
   <h2>Welcome to Sierre!</h2>
   <p>Click the link below to confirm your email address:</p>
   <a href="{{ .ConfirmationURL }}">Confirm Email Address</a>
   <p>If you didn't create an account, you can safely ignore this email.</p>
   ```

### 3.2 Password Reset Template
1. **Select "Reset password"**
2. **Update the template:**
   ```html
   <h2>Reset Your Password</h2>
   <p>Click the link below to reset your password:</p>
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   <p>This link will expire in 24 hours.</p>
   ```

## 🔧 Step 4: Environment Variables

### 4.1 Update .env.local
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zbwreyfltocaegzgixix.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://sierre.vercel.app
NEXT_PUBLIC_APP_NAME=Sierre
```

### 4.2 Update Vercel Environment Variables
1. **Go to Vercel Dashboard → Your Project → Settings → Environment Variables**
2. **Add/Update:**
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://zbwreyfltocaegzgixix.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   NEXT_PUBLIC_APP_URL = https://sierre.vercel.app
   NEXT_PUBLIC_APP_NAME = Sierre
   ```

## 🧪 Step 5: Test Your Setup

### 5.1 Run the Test Script
```bash
# Test sign up
node test-auth-fix.js

# Test sign in (after email confirmation)
node test-auth-fix.js signin
```

### 5.2 Manual Testing Checklist
- [ ] Sign up with real email
- [ ] Receive confirmation email (check inbox + spam)
- [ ] Click confirmation link
- [ ] Get redirected to dashboard
- [ ] Sign out and sign in successfully
- [ ] Test password reset functionality

## 🚨 Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify SMTP configuration
3. Check Gmail app password is correct
4. Ensure 2FA is enabled on Gmail

### Redirect Issues
1. Verify redirect URLs are added to Supabase
2. Check Site URL is set correctly
3. Clear browser cache and cookies
4. Test with incognito/private browsing

### "Invalid Credentials" Error
1. Ensure email is confirmed first
2. Check password is correct
3. Try password reset if needed
4. Clear browser data and try again

## 🔒 Security Best Practices

1. **Use HTTPS in production**
2. **Set secure cookie options**
3. **Implement rate limiting**
4. **Use strong password requirements**
5. **Enable email confirmation**
6. **Regular security audits**

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Test with the provided scripts
3. Verify all configuration steps
4. Check browser console for errors

---

**Your authentication system will be production-ready after completing these steps!** 🎉
