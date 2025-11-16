# Credit Management Guide

Quick guide for managing user credits during testing and production.

---

## 🚀 Quick Start - Add Credits Now (3 Methods)

### Method 1: Supabase SQL Editor (Fastest - 30 seconds)

1. Go to: https://supabase.com/dashboard/project/clwnebahltkbcjnzexwh/editor
2. Click "New query"
3. Paste this SQL (replace with your email):

```sql
-- Replace 'your-email@example.com' with YOUR actual email
UPDATE users
SET credits = 1000
WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT email, credits FROM users WHERE email = 'your-email@example.com';
```

4. Click "Run"
5. You should see: `UPDATE 1` and your credits should show `1000`
6. Refresh your CRM page - you'll see 1000 credits!

---

### Method 2: Admin API Endpoint (After Deployment)

Once the new code is deployed, you can use curl:

```bash
curl -X POST https://sivio.vercel.app/api/admin/add-credits \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: YOUR_CRON_SECRET" \
  -d '{
    "email": "your-email@example.com",
    "credits": 1000
  }'
```

**Response**:
```json
{
  "success": true,
  "user": {
    "email": "your-email@example.com",
    "previous_credits": 0,
    "new_credits": 1000,
    "credits_added": 1000
  }
}
```

---

### Method 3: Supabase Table Editor (Visual)

1. Go to: https://supabase.com/dashboard/project/clwnebahltkbcjnzexwh/editor
2. Click "Table Editor" in sidebar
3. Select "users" table
4. Find your row (search by email)
5. Click on the "credits" cell
6. Type `1000`
7. Press Enter
8. Done! Refresh CRM page

---

## 📊 Checking Your Credits

### In the App:
- Go to `/crm` page
- Click "Table" view
- Select any jobs
- Click "Contact Finder" button
- Modal shows: "Your balance: X credits"

### In Supabase:
```sql
SELECT email, credits, created_at
FROM users
ORDER BY created_at DESC;
```

---

## 💰 Credit Transaction History

### View all transactions:
```sql
SELECT
  t.created_at,
  u.email,
  t.amount,
  t.type,
  t.status,
  t.description
FROM credit_transactions t
JOIN users u ON u.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 20;
```

### View your transactions:
```sql
SELECT
  created_at,
  amount,
  type,
  status,
  description
FROM credit_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com')
ORDER BY created_at DESC;
```

---

## 🎯 Common Scenarios

### Give yourself unlimited credits for testing:
```sql
UPDATE users
SET credits = 999999
WHERE email = 'your-email@example.com';
```

### Reset your credits to 0:
```sql
UPDATE users
SET credits = 0
WHERE email = 'your-email@example.com';
```

### Give all users 100 credits:
```sql
UPDATE users
SET credits = 100;
```

### Add 500 credits to a specific user:
```sql
UPDATE users
SET credits = credits + 500
WHERE email = 'specific-user@example.com';
```

---

## 🔧 Admin API Usage

### Add credits via API:
```bash
# Replace YOUR_CRON_SECRET with actual value from .env.local
curl -X POST https://sivio.vercel.app/api/admin/add-credits \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: 94ca17e1e664ac5b8427c48a3f4f18149a646b63397e78f520f23adfb118b9b6" \
  -d '{
    "email": "user@example.com",
    "credits": 1000
  }'
```

### Error Responses:

**Unauthorized**:
```json
{ "error": "Unauthorized - Invalid admin secret" }
```

**User not found**:
```json
{ "error": "User not found" }
```

**Invalid credits**:
```json
{ "error": "Credits must be a positive number" }
```

---

## 📈 Production Credit Management

### Future Integration Options:

#### 1. Stripe Payment Integration
- User buys credit packages ($10 = 100 credits)
- Webhook updates credits automatically
- Transaction logged in `credit_transactions`

#### 2. Subscription Plans
- Free: 10 credits/month
- Pro: 100 credits/month ($29/mo)
- Enterprise: Unlimited ($99/mo)

#### 3. Referral System
- Invite friend → +50 credits
- Friend signs up → +50 credits

#### 4. Admin Dashboard
- Build admin UI to manage credits
- View all users and balances
- Bulk credit adjustments
- Transaction history

---

## 🚨 Important Notes

### Current Setup:
- ✅ Credits stored in `users.credits` column
- ✅ Transactions logged in `credit_transactions` table
- ✅ Pending transactions created on trigger
- ✅ Completed when contacts delivered
- ⚠️ No automatic refunds yet (if n8n fails)

### Credit Flow:
1. User triggers Contact Finder → Credits reserved (pending)
2. n8n finds contacts → Credits finalized (completed)
3. If n8n fails → Credits stay pending (manual refund needed)

### To Add Automatic Refunds:
Add a cron job that checks for pending transactions older than 1 hour and refunds them.

---

## 🎁 Recommended Testing Credits

For thorough testing, give yourself:

```sql
UPDATE users
SET credits = 10000  -- Enough for extensive testing
WHERE email = 'your-email@example.com';
```

This allows you to:
- Test with multiple jobs (up to 100 jobs × 10 contacts = 1000 credits per test)
- Test different contact counts (1, 3, 5, 10)
- Test insufficient credits scenario (reduce to 5 credits)
- Test edge cases without worrying about running out

---

## 🔍 Debugging Credit Issues

### Credits not deducting:
1. Check `/api/contact-finder/trigger` logs
2. Verify credit transaction was created:
```sql
SELECT * FROM credit_transactions
WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com')
ORDER BY created_at DESC LIMIT 1;
```

### Credits stuck in "pending":
1. n8n workflow didn't complete
2. Check n8n execution logs
3. Manually complete transaction:
```sql
UPDATE credit_transactions
SET status = 'completed'
WHERE id = 'transaction-id-here';
```

### Credits not refunding:
1. Currently manual process
2. Find pending transaction:
```sql
SELECT * FROM credit_transactions WHERE status = 'pending';
```
3. Refund:
```sql
-- Add credits back
UPDATE users
SET credits = credits + AMOUNT_TO_REFUND
WHERE id = 'user-id';

-- Mark transaction as failed
UPDATE credit_transactions
SET status = 'failed',
    description = description || ' - Refunded due to workflow failure'
WHERE id = 'transaction-id';
```

---

## ✅ Quick Checklist

Before testing Contact Finder:

- [ ] Add credits to your account (Method 1 above)
- [ ] Verify credits show in CRM page
- [ ] Test with 1 job, 1 contact first (costs 1 credit)
- [ ] Check credit balance decreases after run
- [ ] Verify transaction logged in Supabase

---

**Ready to add credits?** Use Method 1 (Supabase SQL Editor) - it's the fastest!
