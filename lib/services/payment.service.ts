import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async createPaymentIntent(bookingId: string, amount: number, currency: string = 'usd') {
    // Get booking details
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('*, client:profiles(*), boyfriend:boyfriends(*)')
      .eq('id', bookingId)
      .single();

    if (!booking) throw new Error('Booking not found');

    // Create payment intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        booking_id: bookingId,
        client_id: booking.client_id,
        boyfriend_id: booking.boyfriend_id,
      },
    });

    // Update booking with payment intent
    await this.supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('id', bookingId);

    return paymentIntent;
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      await this.supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          status: 'confirmed'
        })
        .eq('payment_intent_id', paymentIntentId);

      // Update boyfriend earnings
      const { data: booking } = await this.supabase
        .from('bookings')
        .select('boyfriend_earnings, boyfriend_id')
        .eq('payment_intent_id', paymentIntentId)
        .single();

      if (booking) {
        const { data: boyfriend } = await this.supabase
          .from('profiles')
          .select('total_earnings')
          .eq('id', booking.boyfriend_id)
          .single();

        if (boyfriend) {
          await this.supabase
            .from('profiles')
            .update({
              total_earnings: (boyfriend.total_earnings || 0) + booking.boyfriend_earnings
            })
            .eq('id', booking.boyfriend_id);
        }
      }
    }

    return paymentIntent;
  }

  async processRefund(bookingId: string, amount: number, reason: string) {
    const { data: booking } = await this.supabase
      .from('bookings')
      .select('payment_intent_id, stripe_payment_id')
      .eq('id', bookingId)
      .single();

    if (!booking?.stripe_payment_id) throw new Error('Payment not found');

    const refund = await this.stripe.refunds.create({
      payment_intent: booking.payment_intent_id,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer',
      metadata: {
        booking_id: bookingId,
        reason
      }
    });

    // Update booking
    await this.supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        cancellation_reason: reason
      })
      .eq('id', bookingId);

    return refund;
  }
}
