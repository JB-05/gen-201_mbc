import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { payment_id, order_id, signature } = body;

        // Validate required fields
        if (!payment_id || !order_id || !signature) {
            return NextResponse.json(
                { error: 'Missing required fields: payment_id, order_id, signature' },
                { status: 400 }
            );
        }

        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!razorpayKeySecret) {
            return NextResponse.json(
                { error: 'Razorpay key secret not configured' },
                { status: 500 }
            );
        }

        // Create expected signature
        const expectedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');

        // Verify signature
        const isSignatureValid = expectedSignature === signature;

        if (isSignatureValid) {
            return NextResponse.json({
                verified: true,
                message: 'Payment verified successfully',
            });
        } else {
            return NextResponse.json(
                {
                    verified: false,
                    error: 'Invalid payment signature',
                },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment' },
            { status: 500 }
        );
    }
}



