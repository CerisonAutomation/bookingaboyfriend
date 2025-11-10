-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boyfriends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Boyfriends policies
CREATE POLICY "Anyone can view active boyfriends" ON public.boyfriends
FOR SELECT USING (active = true);

CREATE POLICY "Boyfriends can update own profile" ON public.boyfriends
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Boyfriends can insert own profile" ON public.boyfriends
FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = boyfriend_id);

CREATE POLICY "Clients can create bookings" ON public.bookings
FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = boyfriend_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);

CREATE POLICY "Users can send messages" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

CREATE POLICY "Users can update their conversations" ON public.conversations
FOR UPDATE USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed bookings" ON public.reviews
FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = booking_id AND client_id = auth.uid() AND status = 'completed'
  )
);

-- User behavior policies (for analytics)
CREATE POLICY "Users can view own behavior data" ON public.user_behavior
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert behavior data" ON public.user_behavior
FOR INSERT WITH CHECK (true);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boyfriends_updated_at BEFORE UPDATE ON public.boyfriends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
