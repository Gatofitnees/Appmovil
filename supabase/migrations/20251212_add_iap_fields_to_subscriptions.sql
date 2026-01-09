-- Add In-App Purchase Fields to user_subscriptions Table
-- This migration adds support for RevenueCat integration and native app store purchases

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT, -- 'paypal', 'app_store', 'google_play'
  ADD COLUMN IF NOT EXISTS receipt_data TEXT, -- Store the full receipt for validation
  ADD COLUMN IF NOT EXISTS platform TEXT, -- 'ios', 'android', 'web'
  ADD COLUMN IF NOT EXISTS order_id TEXT, -- Google Play order ID or Apple transaction ID
  ADD COLUMN IF NOT EXISTS revenuecat_customer_id TEXT UNIQUE, -- RevenueCat unique ID
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT; -- Keep for backward compatibility with existing PayPal subs

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_method 
  ON public.user_subscriptions(payment_method);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_platform 
  ON public.user_subscriptions(platform);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_revenuecat_customer_id 
  ON public.user_subscriptions(revenuecat_customer_id);

-- Add comment to table for documentation
COMMENT ON TABLE public.user_subscriptions IS 'User subscription records with support for PayPal (web), App Store (iOS), and Google Play (Android) payment methods';

COMMENT ON COLUMN public.user_subscriptions.payment_method IS 'Payment method used: paypal, app_store, or google_play';
COMMENT ON COLUMN public.user_subscriptions.receipt_data IS 'Full receipt from payment provider for validation and auditing';
COMMENT ON COLUMN public.user_subscriptions.platform IS 'Platform: ios, android, or web';
COMMENT ON COLUMN public.user_subscriptions.order_id IS 'Unique order identifier from payment provider';
COMMENT ON COLUMN public.user_subscriptions.revenuecat_customer_id IS 'RevenueCat customer ID for webhook integration';
COMMENT ON COLUMN public.user_subscriptions.paypal_subscription_id IS 'PayPal subscription ID (deprecated, kept for backward compatibility)';
