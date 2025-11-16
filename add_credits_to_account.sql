-- Add Credits to Your Account
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/clwnebahltkbcjnzexwh/editor

-- Option 1: Add credits by email (recommended)
-- Replace 'your-email@example.com' with your actual email
UPDATE users
SET credits = 1000  -- Set to 1000 credits for testing
WHERE email = 'your-email@example.com';

-- Option 2: Add credits to ALL users (if you want to give everyone credits)
UPDATE users
SET credits = 1000;

-- Option 3: Add credits by clerk_id (if you know your Clerk ID)
-- You can find your clerk_id by running: SELECT * FROM users;
UPDATE users
SET credits = 1000
WHERE clerk_id = 'your-clerk-id-here';

-- Verify the update worked
SELECT id, email, credits, created_at
FROM users
ORDER BY created_at DESC;
