# GEN 201 Registration System - Setup Guide

This guide will help you set up the complete registration system with admin dashboard, Supabase integration, and Razorpay payment processing.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Razorpay account (for payment processing)

## 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 2. Supabase Setup

### Step 1: Create a new Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Run database migrations
Execute the following SQL files in your Supabase SQL editor in order:

1. `supabase/migrations/001_create_registration_tables.sql`
2. `supabase/migrations/002_security_policies.sql`
3. `supabase/migrations/003_payment_integration.sql`
4. `supabase/migrations/004_payment_security_policies.sql`

### Step 3: Create your first admin user
After setting up authentication, run this SQL to make a user an admin:

```sql
-- Replace 'user_uuid_here' with the actual auth.users.id of your admin user
INSERT INTO public.admins (auth_user_id, name, email)
VALUES ('user_uuid_here', 'Admin Name', 'admin@example.com');
```

## 3. Razorpay Setup

### Step 1: Create a Razorpay account
1. Go to [razorpay.com](https://razorpay.com)
2. Sign up and complete KYC verification
3. Go to Settings > API Keys
4. Generate API keys (Key ID and Key Secret)

### Step 2: Configure webhooks (Optional)
For production, set up webhooks to handle payment status updates:
- Webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`

## 4. Installation

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Run the development server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 5. Features Overview

### Registration System
- **Multi-step form**: Team details, team lead, members, project details
- **Validation**: Comprehensive form validation with Zod
- **Payment integration**: Razorpay payment gateway
- **Database storage**: All data stored in Supabase

### Admin Dashboard (`/admin`)
- **Authentication**: Secure admin login
- **Registration management**: View, filter, and update team statuses
- **District insights**: Analytics by district and school
- **Status management**: Bulk operations for team approval
- **Payment tracking**: Revenue and payment status monitoring

### Database Schema

#### Core Tables:
- `teams`: Team information and status
- `team_members`: Individual team member details
- `project_details`: Project information
- `teacher_verifications`: Teacher contact information
- `payments`: Payment transactions
- `admins`: Admin user management
- `team_status_logs`: Audit trail for status changes

## 6. Registration Flow

1. **Team Registration**: User fills multi-step form
2. **Payment**: ₹50 registration fee via Razorpay
3. **Verification**: Payment signature verification
4. **Database Storage**: Complete registration data saved
5. **Status Tracking**: Admin can review and update status

## 7. Admin Operations

### Team Status Management:
- **Pending**: Initial status after registration
- **Shortlisted**: Selected for next round
- **Rejected**: Not selected
- **Verified**: Final approval

### District Analytics:
- Registration counts by district
- School participation statistics
- Success rates and trends

### Payment Insights:
- Revenue tracking
- Payment status monitoring
- Failed payment analysis

## 8. Security Features

- **Row Level Security (RLS)**: Supabase policies protect data
- **Admin Authentication**: Secure admin access
- **Payment Verification**: Razorpay signature validation
- **Audit Logging**: All status changes tracked

## 9. Deployment

### Environment Variables for Production:
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_production_razorpay_key_id
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
```

### Build and Deploy:
```bash
npm run build
npm start
```

## 10. Customization

### Registration Fee:
Change the `REGISTRATION_FEE` constant in `lib/services/payment.ts`

### Form Fields:
Modify the schema in `components/registration/RegistrationForm.tsx`

### Admin Dashboard:
Customize components in `components/admin/` directory

## 11. Troubleshooting

### Common Issues:

1. **Payment failures**: Check Razorpay key configuration
2. **Database errors**: Verify Supabase connection and RLS policies
3. **Admin access**: Ensure user is added to admins table
4. **Build errors**: Check TypeScript types and imports

### Debug Mode:
Set `NODE_ENV=development` for detailed error logs

## 12. Support

For technical support or questions about the registration system:
- Check the console logs for detailed error messages
- Verify environment variables are correctly set
- Ensure database migrations have been run
- Test payment flow in Razorpay test mode first

---

This system provides a complete solution for hackathon registration with payment processing, admin management, and comprehensive analytics.

