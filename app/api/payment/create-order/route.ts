import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        // Ensure Razorpay is properly configured
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            return NextResponse.json(
                { error: 'Payment service is not configured. Please contact administrator.' },
                { status: 503 }
            );
        }
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const body = await request.json();
        const { amount, currency, receipt, notes } = body;

        // Validate required fields
        if (!amount || !currency || !receipt) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, currency, receipt' },
                { status: 400 }
            );
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: amount, // Amount in paise
            currency: currency,
            receipt: receipt,
            notes: notes || {},
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
        });
    } catch (error: any) {
        console.error('Error creating Razorpay order:', error);
        const message = error?.error?.description || error?.message || 'Failed to create payment order';
        return new NextResponse(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }
}

