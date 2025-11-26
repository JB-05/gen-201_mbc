import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { TablesUpdate, TablesInsert } from '@/types/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    return expected === signature;
}

async function upsertPaymentAndTeam(params: {
    orderId: string;
    paymentId?: string;
    amount?: number;
    currency?: string;
    status: 'completed' | 'failed';
    failureReason?: string;
}) {
    const { orderId, paymentId, amount, currency, status, failureReason } = params;

    // Upsert payment by order_id idempotently
    const { data: existingRaw } = await (supabaseAdmin
        .from('payments' as any) as any)
        .select('id, team_id')
        .eq('order_id', orderId)
        .maybeSingle();
    const existing = existingRaw as { id: string; team_id: string | null } | null;

    if (existing) {
        const updatePayload: TablesUpdate<'payments'> = {};
        if (paymentId !== undefined) updatePayload.payment_id = paymentId ?? null;
        if (amount !== undefined) updatePayload.amount = amount;
        if (currency !== undefined) updatePayload.currency = currency;
        updatePayload.payment_status = status as any;
        if (failureReason !== undefined) updatePayload.failure_reason = failureReason ?? null;
        updatePayload.razorpay_order_id = orderId;

        await (supabaseAdmin.from('payments' as any) as any)
            .update(updatePayload as any)
            .eq('id', existing.id);

        if (existing.team_id && status === 'completed') {
            await (supabaseAdmin.from('teams' as any) as any)
                .update({ payment_status: 'completed' })
                .eq('id', existing.team_id);
        }
        return;
    }
    // If no existing payment is found, ignore the webhook; the order should have been created beforehand.
    return;
}

export async function POST(request: NextRequest) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const payload = await request.text();
        const signature = request.headers.get('x-razorpay-signature') || '';

        if (!signature || !verifySignature(payload, signature, webhookSecret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(payload);
        const eventType = event?.event as string;

        // Extract common fields safely
        const orderId = event?.payload?.order?.entity?.id || event?.payload?.payment?.entity?.order_id;
        const paymentId = event?.payload?.payment?.entity?.id;
        const amount = event?.payload?.payment?.entity?.amount ? Math.round(event.payload.payment.entity.amount / 100) : undefined; // convert paise→rupees
        const currency = event?.payload?.payment?.entity?.currency;
        const failureReason = event?.payload?.payment?.entity?.error_description || event?.payload?.payment?.entity?.notes?.failure_reason;

        if (!orderId) {
            return NextResponse.json({ error: 'Missing order id in event' }, { status: 400 });
        }

        switch (eventType) {
            case 'payment.captured':
            case 'order.paid': {
                await upsertPaymentAndTeam({
                    orderId,
                    paymentId,
                    amount,
                    currency,
                    status: 'completed',
                });
                break;
            }
            case 'payment.failed': {
                await upsertPaymentAndTeam({
                    orderId,
                    paymentId,
                    amount,
                    currency,
                    status: 'failed',
                    failureReason,
                });
                break;
            }
            default: {
                // Ignore other events
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}


