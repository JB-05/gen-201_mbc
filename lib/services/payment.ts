import { loadScript } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

declare global {
    interface Window {
        Razorpay: any;
    }
}

import { getRegistrationFee, getEventName, getEventDescription, getPaymentThemeColor, getCurrency } from './config';

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

interface PaymentOptions {
    teamName: string;
    email: string;
    phone: string;
}

export async function initializePayment(options: PaymentOptions): Promise<{ success: boolean; orderId?: string; error?: string }> {
    // console.log('initializePayment called with options:', options); // Removed for production security
    try {
        // Load Razorpay script
        console.log('Loading Razorpay script...');
        await loadRazorpayScript();
        console.log('Razorpay script loaded successfully');

        // Get dynamic configuration values
        const registrationFee = await getRegistrationFee();
        const currency = await getCurrency();

        // Call your backend API to create a Razorpay order
        console.log('Calling create-order API...');
        const response = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: registrationFee * 100, // Amount in paise
                currency: currency,
                receipt: `receipt_${Date.now()}`,
                notes: {
                    teamName: options.teamName,
                    email: options.email,
                    phone: options.phone,
                },
            }),
            cache: 'no-store',
        });

        console.log('API response status:', response.status);
        if (!response.ok) {
            const raw = await response.text();
            let errorData: any = {};
            try {
                errorData = JSON.parse(raw);
            } catch {
                // not JSON, keep raw text for debugging
            }
            console.error('API error response:', errorData || raw);
            const message = (errorData && (errorData.error || errorData.message)) || raw || response.statusText || 'Failed to create payment order';
            throw new Error(message);
        }

        const orderData = await response.json();
        // console.log('Order created successfully:', orderData); // Removed for production security

        return {
            success: true,
            orderId: orderData.id,
        };
    } catch (error) {
        console.error('Payment initialization error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to initialize payment',
        };
    }
}

// Ensure Razorpay SDK is loaded
export async function loadRazorpayScript(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return;
    }

    await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!(typeof window !== 'undefined' && (window as any).Razorpay)) {
        throw new Error('Failed to load Razorpay SDK');
    }
}

export async function createRazorpayInstance(
    orderId: string,
    options: PaymentOptions,
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
) {
    console.log('createRazorpayInstance called with orderId');
    if (!RAZORPAY_KEY) {
        console.error('Razorpay key not found in environment variables');
        throw new Error('Razorpay key not found');
    }

    // console.log('Creating Razorpay instance with key:', RAZORPAY_KEY); // Removed for production security

    // Get dynamic configuration values
    const registrationFee = await getRegistrationFee();
    const currency = await getCurrency();
    const eventName = await getEventName();
    const eventDescription = await getEventDescription();
    const themeColor = await getPaymentThemeColor();

    const razorpay = new window.Razorpay({
        key: RAZORPAY_KEY,
        amount: registrationFee * 100, // Amount in paise
        currency: currency,
        name: eventName,
        description: eventDescription,
        order_id: orderId,
        prefill: {
            name: options.teamName,
            email: options.email,
            contact: options.phone,
        },
        theme: {
            color: themeColor,
        },
        // Disable problematic payment methods that cause errors
        payment_method: {
            netbanking: false,
            wallet: false,
            upi: false,
            emi: false,
            paylater: false,
        },
        modal: {
            ondismiss: () => {
                onFailure({ message: 'Payment cancelled by user' });
            },
        },
        handler: (response: any) => {
            // console.log('Payment successful, response:', response); // Removed for production security
            onSuccess(response);
        },
        // Add error handler
        notes: {
            team_name: options.teamName,
            email: options.email,
            phone: options.phone,
        },
    });

    // console.log('Razorpay instance created successfully'); // Removed for production security
    return razorpay;
}

export async function verifyPayment(paymentId: string, orderId: string, signature: string) {
    try {
        // Call your backend API to verify the payment
        const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payment_id: paymentId,
                order_id: orderId,
                signature: signature,
            }),
        });

        if (!response.ok) {
            throw new Error('Payment verification failed');
        }

        const verificationResult = await response.json();
        return { success: verificationResult.verified };
    } catch (error) {
        console.error('Payment verification error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment verification failed'
        };
    }
}

// Create payment record in database
export async function createPaymentRecord(
    teamId: string,
    orderId: string,
    paymentId?: string,
    signature?: string,
    status: 'pending' | 'completed' | 'failed' = 'pending'
) {
    try {
        // Get dynamic configuration values
        const registrationFee = await getRegistrationFee();
        const currency = await getCurrency();

        const { data, error } = await (supabase as any)
            .from('payments')
            .insert([{
                team_id: teamId,
                order_id: orderId,
                payment_id: paymentId,
                signature: signature,
                amount: registrationFee, // Amount in rupees
                currency: currency,
                payment_status: status,
                razorpay_order_id: orderId
            }])
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error creating payment record:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create payment record'
        };
    }
}

// Update payment status
export async function updatePaymentStatus(
    orderId: string,
    paymentId: string,
    signature: string,
    status: 'completed' | 'failed',
    failureReason?: string
) {
    try {
        const updateData: any = {
            payment_id: paymentId,
            signature: signature,
            payment_status: status,
        };

        if (failureReason) {
            updateData.failure_reason = failureReason;
        }

        const { data, error } = await (supabase as any)
            .from('payments')
            .update(updateData)
            .eq('order_id', orderId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { success: true, payment: data };
    } catch (error) {
        console.error('Error updating payment status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update payment status'
        };
    }
}
