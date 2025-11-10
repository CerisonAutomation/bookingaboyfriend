import { createClient } from '@supabase/supabase-js';

export class AnalyticsService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async trackEvent(eventType: string, eventData: any, userId?: string) {
    const { error } = await this.supabase
      .from('user_behavior')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getDashboardMetrics(timeRange: string = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // User metrics
    const { data: userMetrics } = await this.supabase
      .from('user_behavior')
      .select('event_type, created_at, user_id')
      .gte('created_at', startDate.toISOString());

    // Booking metrics
    const { data: bookingMetrics } = await this.supabase
      .from('bookings')
      .select('status, total_amount, created_at')
      .gte('created_at', startDate.toISOString());

    // Revenue metrics
    const { data: revenueMetrics } = await this.supabase
      .from('bookings')
      .select('total_amount, platform_fee, status')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate.toISOString());

    return {
      users: {
        total: new Set(userMetrics?.map((u: any) => u.user_id).filter(Boolean)).size,
        active: userMetrics?.filter((u: any) => u.event_type === 'login').length || 0
      },
      bookings: {
        total: bookingMetrics?.length || 0,
        completed: bookingMetrics?.filter((b: any) => b.status === 'completed').length || 0,
        revenue: revenueMetrics?.reduce((sum: number, b: any) => sum + b.total_amount, 0) || 0,
        platformFees: revenueMetrics?.reduce((sum: number, b: any) => sum + b.platform_fee, 0) || 0
      }
    };
  }

  async getUserEngagement(userId: string) {
    const { data, error } = await this.supabase
      .from('user_behavior')
      .select('event_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return {
      lastActivity: data?.[0]?.created_at,
      totalEvents: data?.length || 0,
      eventTypes: data?.reduce((acc: Record<string, number>, event: any) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
