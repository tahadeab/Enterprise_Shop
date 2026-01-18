# Stripe Payment Setup

## ⚠️ IMPORTANT: Configure Stripe Secret Key

The payment system requires a Stripe secret key to function. Follow these steps to configure it:

## Step 1: Get Your Stripe Secret Key

1. Go to https://dashboard.stripe.com/apikeys
2. Sign in to your Stripe account (or create one if you don't have it)
3. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)

## Step 2: Configure the Secret in Supabase

### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project: `maylztbnssikkjdqvumg`
3. Navigate to **Edge Functions** in the left sidebar
4. Click on **Secrets** or **Environment Variables**
5. Add a new secret:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Your Stripe secret key (e.g., `sk_test_...`)
6. Save the secret

### Option B: Via Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here --project-ref maylztbnssikkjdqvumg
```

## Step 3: Test the Payment Flow

1. Add products to your cart
2. Proceed to checkout
3. Fill in shipping address
4. Click "Proceed to Payment"
5. You'll be redirected to Stripe Checkout
6. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
7. Complete the payment
8. You'll be redirected back to the success page

## Test Card Numbers

For testing, use these Stripe test cards:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

## Webhook Configuration (Production Only)

For production, you'll need to set up webhooks:

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://maylztbnssikkjdqvumg.supabase.co/functions/v1/verify_stripe_payment`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret
5. Add it as another Supabase secret: `STRIPE_WEBHOOK_SECRET`

## Current Status

- ✅ Stripe Edge Functions deployed
- ✅ Payment flow implemented
- ⚠️ **STRIPE_SECRET_KEY needs to be configured**
- ⚠️ Webhook secret not required for testing (only for production)

## Troubleshooting

### "Stripe secret key not configured" error
- The `STRIPE_SECRET_KEY` secret is not set in Supabase
- Follow Step 2 above to configure it

### Payment redirects but doesn't complete
- Check Supabase Edge Function logs
- Verify the secret key is correct
- Ensure you're using the correct Stripe mode (test vs live)

### "Invalid API key" error
- The secret key format is incorrect
- Make sure you're using the **Secret key**, not the Publishable key
- Secret keys start with `sk_`, publishable keys start with `pk_`

## Security Notes

- Never commit your Stripe secret key to version control
- Use test keys for development
- Use live keys only in production
- Rotate keys if they're ever exposed
- Monitor your Stripe dashboard for suspicious activity
