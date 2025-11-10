import { createClient } from '@supabase/supabase-js';
import { PaymentService } from './payment.service';

export class BookingService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private paymentService = new PaymentService();

  async createBooking(bookingData: {
    boyfriendId: string;
    startTime: Date;
    duration: number;
    serviceType: string;
    location?: string;
    specialRequests?: string;
  }) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get boyfriend details
    const { data: boyfriend } = await this.supabase
      .from('boyfriends')
      .select('hourly_rate')
      .eq('id', bookingData.boyfriendId)
      .single();

    if (!boyfriend) throw new Error('Boyfriend not found');

    const totalAmount = boyfriend.hourly_rate * bookingData.duration;
    const platformFee = totalAmount * 0.15; // 15% platform fee
    const boyfriendEarnings = totalAmount - platformFee;

    // Create booking
    const { data: booking, error } = await this.supabase
      .from('bookings')
      .insert({
        client_id: user.id,
        boyfriend_id: bookingData.boyfriendId,
        start_time: bookingData.startTime.toISOString(),
        end_time: new Date(bookingData.startTime.getTime() + bookingData.duration * 60 * 60 * 1000).toISOString(),
        duration_hours: bookingData.duration,
        service_type: bookingData.serviceType,
        location: bookingData.location,
        special_requests: bookingData.specialRequests,
        total_amount: totalAmount,
        platform_fee: platformFee,
        boyfriend_earnings: boyfriendEarnings
      })
      .select()
      .single();

    if (error) throw error;

    // Create payment intent
    const paymentIntent = await this.paymentService.createPaymentIntent(
      booking.id,
      totalAmount
    );

    return { booking, clientSecret: paymentIntent.client_secret };
  }

  async getUserBookings() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('bookings')
      .select(`
        *,
        client:profiles!client_id(display_name, avatar_url),
        boyfriend:boyfriends(id, profiles(display_name, avatar_url))
      `)
      .or(`client_id.eq.${user.id},boyfriend_id.eq.${user.id}`)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateBookingStatus(bookingId: string, status: string, notes?: string) {
    const { error } = await this.supabase
      .from('bookings')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
  }

  async cancelBooking(bookingId: string, reason: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .or(`client_id.eq.${user.id},boyfriend_id.eq.${user.id}`);

    if (error) throw error;
  }
}
