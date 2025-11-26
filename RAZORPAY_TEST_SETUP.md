# 🧪 Razorpay Test Mode Integration Guide

## 📋 **Quick Setup Checklist**

### ✅ **Step 1: Get Test Credentials**
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to **Test Mode** (toggle in top-left corner)
3. Go to **Settings** → **API Keys** → **Generate Test Key**
4. Copy your credentials:
   - **Key ID**: `rzp_test_xxxxxxxxxx`
   - **Key Secret**: `xxxxxxxxxxxxxxxx`

### ✅ **Step 2: Create Environment File**
Create `.env.local` in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Test Mode Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_secret_key_here

# Environment
NODE_ENV=development
```

### ✅ **Step 3: Test Payment Flow**
Your current integration supports:
- ✅ Order creation via `/api/payment/create-order`
- ✅ Payment verification via `/api/payment/verify`
- ✅ Database integration with team registration
- ✅ Razorpay modal integration

## 🧪 **Test Mode Features**

### **Test Payment Methods**
In test mode, use these test card details:

#### **Successful Payments:**
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date
- **CVV**: Any 3-digit number
- **Name**: Any name

#### **Failed Payments:**
- **Card Number**: `4000 0000 0000 0002` (Declined)
- **Card Number**: `4000 0000 0000 0069` (Expired)

#### **UPI Testing:**
- **UPI ID**: `success@razorpay` (Success)
- **UPI ID**: `failure@razorpay` (Failure)

#### **Net Banking:**
- Select any bank and use test credentials provided

## 🔧 **Current Integration Status**

Your project already has:

### **✅ Backend API Routes**
- `app/api/payment/create-order/route.ts` - Creates Razorpay orders
- `app/api/payment/verify/route.ts` - Verifies payment signatures

### **✅ Frontend Integration**
- `lib/services/payment.ts` - Payment service functions
- `components/registration/RegistrationForm.tsx` - Form with payment integration

### **✅ Database Integration**
- Payment records stored in `payments` table
- Team status updated after successful payment
- Complete audit trail maintained

## 🚀 **Testing Your Integration**

### **1. Start Development Server**
```bash
npm run dev
```

### **2. Test Registration Flow**
1. Go to `http://localhost:3000/register`
2. Fill out the registration form
3. Complete all steps until payment
4. Use test card details for payment
5. Verify successful registration in database

### **3. Check Payment Records**
After successful payment, verify:
- Team record created in `teams` table
- Payment record in `payments` table with status `completed`
- Team status updated to reflect payment completion

## 🔍 **Debugging & Troubleshooting**

### **Common Issues:**

#### **1. "Razorpay key not found" Error**
- ✅ Verify `.env.local` file exists
- ✅ Check environment variable names match exactly
- ✅ Restart development server after adding env vars

#### **2. "Payment service not configured" Error**
- ✅ Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- ✅ Check API route is accessible at `/api/payment/create-order`

#### **3. Payment Verification Fails**
- ✅ Verify webhook signature calculation
- ✅ Check `RAZORPAY_KEY_SECRET` is correct
- ✅ Ensure order_id matches between creation and verification

### **Debug Mode**
Enable detailed logging by adding to `.env.local`:
```env
DEBUG=razorpay:*
```

## 📊 **Test Scenarios**

### **Scenario 1: Successful Payment**
1. Complete registration form
2. Use test card `4111 1111 1111 1111`
3. Verify payment success
4. Check database for completed records

### **Scenario 2: Failed Payment**
1. Complete registration form  
2. Use test card `4000 0000 0000 0002`
3. Verify payment failure handling
4. Check no partial records created

### **Scenario 3: Payment Cancellation**
1. Complete registration form
2. Close payment modal without paying
3. Verify graceful error handling
4. Allow user to retry payment

## 🔐 **Security Checklist**

- ✅ API keys stored in environment variables
- ✅ Payment verification using signature validation
- ✅ No sensitive data exposed to frontend
- ✅ Proper error handling without exposing internals

## 📈 **Monitoring & Analytics**

Your integration includes:
- Payment success/failure tracking
- Revenue analytics functions
- District-wise payment insights
- Admin dashboard for payment monitoring

## 🚀 **Going Live**

When ready for production:

1. **Switch to Live Mode** in Razorpay Dashboard
2. **Generate Live API Keys**
3. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key
   RAZORPAY_KEY_SECRET=your_live_secret
   ```
4. **Complete KYC Verification** in Razorpay
5. **Set up Webhooks** for payment status updates
6. **Test thoroughly** with small amounts first

## 💡 **Best Practices**

1. **Always test in Test Mode first**
2. **Implement proper error handling**
3. **Log payment attempts for debugging**
4. **Validate all payment data**
5. **Use webhooks for payment status updates**
6. **Monitor payment success rates**

---

Your Razorpay integration is **production-ready** and follows industry best practices! 🎉



