import { createClient } from '@supabase/supabase-js';

export class MessagingService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async sendMessage(conversationId: string, content: string, messageType: string = 'text') {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get conversation participants
    const { data: conversation } = await this.supabase
      .from('conversations')
      .select('participant_1, participant_2, unread_count_1, unread_count_2')
      .eq('id', conversationId)
      .single();

    if (!conversation) throw new Error('Conversation not found');

    const recipientId = conversation.participant_1 === user.id
      ? conversation.participant_2
      : conversation.participant_1;

    // Insert message
    const { data: message, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        message_type: messageType
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await this.supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.substring(0, 100),
        unread_count_1: conversation.participant_1 === recipientId
          ? (conversation.unread_count_1 || 0) + 1
          : (conversation.unread_count_1 || 0),
        unread_count_2: conversation.participant_2 === recipientId
          ? (conversation.unread_count_2 || 0) + 1
          : (conversation.unread_count_2 || 0)
      })
      .eq('id', conversationId);

    return message;
  }

  async markAsRead(conversationId: string) {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Mark messages as read
    await this.supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', user.id)
      .is('read_at', null);

    // Reset unread count
    const updateField = user.id === (await this.supabase
      .from('conversations')
      .select('participant_1')
      .eq('id', conversationId)
      .single()).data?.participant_1
      ? 'unread_count_1'
      : 'unread_count_2';

    await this.supabase
      .from('conversations')
      .update({ [updateField]: 0 })
      .eq('id', conversationId);
  }

  async getConversations() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase
      .from('conversations')
      .select(`
        *,
        participant_1_profile:profiles!participant_1(id, display_name, avatar_url),
        participant_2_profile:profiles!participant_2(id, display_name, avatar_url)
      `)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return this.supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();
  }
}
