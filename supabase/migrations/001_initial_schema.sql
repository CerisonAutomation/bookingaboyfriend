-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_type AS ENUM ('client', 'boyfriend', 'admin');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

-- Enhanced user profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location JSONB DEFAULT '{}',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  user_type user_type NOT NULL DEFAULT 'client',
  verification_status verification_status DEFAULT 'unverified',
  verification_documents JSONB DEFAULT '[]',
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'vip')),
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boyfriend-specific data
CREATE TABLE public.boyfriends (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  hourly_rate DECIMAL(8,2) NOT NULL,
  availability_schedule JSONB DEFAULT '{}',
  services_offered TEXT[] DEFAULT '{}',
  specializations TEXT[] DEFAULT '{}',
  languages_spoken TEXT[] DEFAULT '{en}',
  height INTEGER,
  weight INTEGER,
  body_type TEXT,
  hair_color TEXT,
  eye_color TEXT,
  ethnicity TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  portfolio_images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMPTZ,
  response_time_minutes INTEGER DEFAULT 60,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking system
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  boyfriend_id UUID NOT NULL REFERENCES public.boyfriends(id),
  status booking_status DEFAULT 'pending',
  service_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,
  location TEXT,
  meeting_point TEXT,
  special_requests TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(8,2) NOT NULL,
  boyfriend_earnings DECIMAL(8,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_intent_id TEXT,
  stripe_payment_id TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time messaging
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  message_type message_type DEFAULT 'text',
  media_url TEXT,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation tracking
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id),
  participant_2 UUID NOT NULL REFERENCES public.profiles(id),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  unread_count_1 INTEGER DEFAULT 0,
  unread_count_2 INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Review system
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  categories JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  response TEXT,
  response_at TIMESTAMPTZ,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User behavior analytics
CREATE TABLE public.user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX idx_profiles_location ON public.profiles USING GIST(ST_Point((location->>'longitude')::float, (location->>'latitude')::float));
CREATE INDEX idx_profiles_rating ON public.profiles(rating DESC);
CREATE INDEX idx_profiles_verification ON public.profiles(verification_status);

CREATE INDEX idx_boyfriends_hourly_rate ON public.boyfriends(hourly_rate);
CREATE INDEX idx_boyfriends_active ON public.boyfriends(active) WHERE active = true;
CREATE INDEX idx_boyfriends_featured ON public.boyfriends(featured) WHERE featured = true;
CREATE INDEX idx_boyfriends_services ON public.boyfriends USING GIN(services_offered);

CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_boyfriend ON public.bookings(boyfriend_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_payment_status ON public.bookings(payment_status);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX idx_conversations_participants ON public.conversations(participant_1, participant_2);

CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

CREATE INDEX idx_user_behavior_user ON public.user_behavior(user_id);
CREATE INDEX idx_user_behavior_event ON public.user_behavior(event_type);
CREATE INDEX idx_user_behavior_created ON public.user_behavior(created_at DESC);
