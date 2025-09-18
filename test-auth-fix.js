// Production Authentication Test Script
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🚀 Production Authentication Test Suite\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables!');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get email from command line or use placeholder
const testEmail = process.argv[2] || 'your-email@gmail.com';
const testPassword = 'TestPassword123!';

async function testSignUp() {
  console.log('🧪 Testing Sign Up with Production Configuration...\n');
  
  if (testEmail === 'your-email@gmail.com') {
    console.log('⚠️  Usage: node test-auth-fix.js your-email@gmail.com');
    console.log('Replace "your-email@gmail.com" with your actual email address.\n');
    return;
  }
  
  console.log(`📧 Testing with: ${testEmail}`);
  console.log('🔗 Redirect URL: http://localhost:3000/auth/callback\n');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (error) {
      console.log('❌ Sign Up Error:', error.message);
      console.log('Error Details:', error);
      return;
    }
    
    console.log('✅ Sign Up Successful!');
    console.log('👤 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('✅ Email Confirmed:', !!data.user?.email_confirmed_at);
    console.log('📬 Confirmation Sent:', !!data.user?.confirmation_sent_at);
    console.log('🔑 Session Active:', !!data.session);
    
    if (!data.user?.email_confirmed_at) {
      console.log('\n📧 IMPORTANT: Check your email for confirmation link!');
      console.log('📱 After confirming, run: node test-auth-fix.js signin');
      console.log('🔍 If you don\'t see the email, check your spam folder.');
    } else {
      console.log('\n🎉 Email already confirmed! You can sign in now.');
    }
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

async function testSignIn() {
  console.log('🧪 Testing Sign In...\n');
  
  if (testEmail === 'your-email@gmail.com') {
    console.log('⚠️  Usage: node test-auth-fix.js your-email@gmail.com signin');
    return;
  }
  
  console.log(`📧 Testing with: ${testEmail}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.log('❌ Sign In Error:', error.message);
      console.log('Error Code:', error.status);
      
      if (error.message.includes('email not confirmed') || error.message.includes('Email not confirmed')) {
        console.log('\n💡 SOLUTION: Your email is not confirmed yet.');
        console.log('📧 Check your email and click the confirmation link.');
        console.log('📱 If you didn\'t receive it, check your spam folder.');
        console.log('🔄 You can also resend the confirmation email from your app.');
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 SOLUTION: Check your email and password.');
        console.log('🔑 Make sure your email is confirmed first.');
        console.log('🔄 Try resetting your password if needed.');
      }
      
      return;
    }
    
    console.log('✅ Sign In Successful!');
    console.log('🎉 Production Authentication is working perfectly!');
    console.log('👤 User:', data.user?.email);
    console.log('🆔 User ID:', data.user?.id);
    console.log('✅ Email Confirmed:', !!data.user?.email_confirmed_at);
    console.log('🔑 Session Active:', !!data.session);
    console.log('⏰ Last Sign In:', data.user?.last_sign_in_at);
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset...\n');
  
  if (testEmail === 'your-email@gmail.com') {
    console.log('⚠️  Usage: node test-auth-fix.js your-email@gmail.com reset');
    return;
  }
  
  console.log(`📧 Sending password reset to: ${testEmail}`);
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:3000/auth/callback'
    });
    
    if (error) {
      console.log('❌ Password Reset Error:', error.message);
      return;
    }
    
    console.log('✅ Password Reset Email Sent!');
    console.log('📧 Check your email for the reset link');
    console.log('🔗 Click the link to reset your password');
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

async function testResendConfirmation() {
  console.log('🧪 Testing Resend Confirmation...\n');
  
  if (testEmail === 'your-email@gmail.com') {
    console.log('⚠️  Usage: node test-auth-fix.js your-email@gmail.com resend');
    return;
  }
  
  console.log(`📧 Resending confirmation to: ${testEmail}`);
  
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback'
      }
    });
    
    if (error) {
      console.log('❌ Resend Error:', error.message);
      return;
    }
    
    console.log('✅ Confirmation Email Resent!');
    console.log('📧 Check your email for the confirmation link');
    
  } catch (err) {
    console.log('❌ Exception:', err.message);
  }
}

// Run the appropriate test
const command = process.argv[3];
const email = process.argv[2];

switch (command) {
  case 'signin':
    testSignIn();
    break;
  case 'reset':
    testPasswordReset();
    break;
  case 'resend':
    testResendConfirmation();
    break;
  default:
    if (email && email !== 'your-email@gmail.com') {
      testSignUp();
    } else {
      console.log('🚀 Production Authentication Test Suite');
      console.log('');
      console.log('Usage:');
      console.log('  node test-auth-fix.js your-email@gmail.com           # Test sign up');
      console.log('  node test-auth-fix.js your-email@gmail.com signin    # Test sign in');
      console.log('  node test-auth-fix.js your-email@gmail.com reset     # Test password reset');
      console.log('  node test-auth-fix.js your-email@gmail.com resend    # Test resend confirmation');
      console.log('');
      console.log('Replace "your-email@gmail.com" with your actual email address.');
    }
    break;
}
