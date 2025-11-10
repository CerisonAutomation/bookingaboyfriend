# Booking a Boyfriend - AI Coding Guidelines

## Architecture Overview

**Tech Stack**: Next.js 15, Supabase, PostgreSQL, Stripe, Redis, Cloudinary, Sentry, Plausible
**Scale Target**: 1M+ users with enterprise-grade security and performance

### Core Architecture Patterns

- **Service Layer**: All business logic in `/lib/services/` as class-based services (e.g., `AuthService`, `PaymentService`)
- **Database**: PostgreSQL with Row Level Security (RLS) policies on all tables
- **Authentication**: Supabase Auth with JWT tokens, user types: `client`, `boyfriend`, `admin`
- **Real-time**: Supabase real-time subscriptions for messaging and live updates
- **Payments**: Stripe integration with webhook verification and payment intents

## Service Layer Conventions

### Service Class Structure
```typescript
// lib/services/example.service.ts
import { createClient } from '@supabase/supabase-js';

export class ExampleService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async methodName(params: Type): Promise<ReturnType> {
    // Input validation
    // Database operations
    // Error handling
    // Return result
  }
}
```

**Key Patterns**:
- Private Supabase client instance
- Async methods with proper TypeScript typing
- Comprehensive error handling with descriptive messages
- Input validation before database operations

## Database Patterns

### Schema Conventions
- **Primary Keys**: UUID with `gen_random_uuid()` default
- **Timestamps**: `created_at` and `updated_at` TIMESTAMPTZ fields
- **JSONB Fields**: For flexible data like `preferences`, `metadata`, `location`
- **Enums**: Use CHECK constraints instead of native enums
- **Indexing**: Strategic indexes on frequently queried columns (user_id, status, dates)

### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view own records" ON public.table_name
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON public.table_name
FOR UPDATE USING (auth.uid() = user_id);
```

**Always implement RLS policies** for data access control.

## Authentication & Authorization

### Middleware Protection
```typescript
// middleware.ts - Route-based access control
const protectedRoutes = ['/dashboard', '/bookings', '/messages', '/profile'];
const adminRoutes = ['/admin'];

if (isProtectedRoute && !session) {
  return NextResponse.redirect(new URL('/login', req.url));
}
```

### User Types & Permissions
- **client**: Can book boyfriends, view profiles, send messages
- **boyfriend**: Can manage availability, view bookings, receive payments
- **admin**: Full system access for management

## Payment Integration

### Stripe Patterns
```typescript
// Payment intent creation
const paymentIntent = await this.stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: 'usd',
  metadata: { booking_id: bookingId }
});

// Webhook verification
const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
```

**Critical**: Never store sensitive payment data locally, always use Stripe's secure methods.

## Real-time Messaging

### Subscription Pattern
```typescript
// Real-time subscriptions
subscribeToMessages(conversationId: string, callback: (message: any) => void) {
  return this.supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, callback)
    .subscribe();
}
```

**Pattern**: Use Supabase channels for real-time features, update conversation metadata on message send.

## Error Handling

### Service Error Patterns
```typescript
async methodName(params: Type): Promise<ReturnType> {
  // Validate inputs
  if (!params.requiredField) {
    throw new Error('Required field missing');
  }

  // Database operations with error checking
  const { data, error } = await this.supabase
    .from('table')
    .select('*')
    .eq('id', params.id);

  if (error) throw error;
  if (!data) throw new Error('Record not found');

  return data;
}
```

**Always**: Validate inputs, check for database errors, provide meaningful error messages.

## API Route Patterns

### Next.js API Routes
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Business logic
    const result = await service.method();

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Pattern**: Auth check first, try-catch blocks, consistent error responses.

## Component Organization

### Directory Structure
```
/components
├── ui/           # Reusable UI components (buttons, inputs, modals)
├── forms/        # Complex forms with validation
├── layouts/      # Layout components (header, sidebar, footer)
└── features/     # Feature-specific components (chat, booking, profile)
```

### Custom Hooks
```typescript
// lib/hooks/use-example.ts
import { useState, useEffect } from 'react';

export function useExample(id: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const result = await service.getById(id);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchData };
}
```

## Testing Patterns

### Unit Tests
```typescript
// __tests__/services/example.service.test.ts
describe('ExampleService', () => {
  let service: ExampleService;

  beforeEach(() => {
    service = new ExampleService();
  });

  it('should perform expected behavior', async () => {
    const result = await service.method(testParams);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// __tests__/booking-flow.test.ts
describe('Booking Flow', () => {
  it('should create booking and process payment', async () => {
    const booking = await bookingService.createBooking(bookingData);
    const payment = await paymentService.confirmPayment(booking.paymentIntentId);

    expect(payment.status).toBe('succeeded');
  });
});
```

## Environment Configuration

### Config Pattern
```typescript
// lib/config/environment.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!
  }
  // ... other services
};
```

**Critical**: Use service role key only for server-side operations, never expose to client.

## Performance Considerations

- **Database**: Strategic indexing, query optimization, connection pooling
- **Caching**: Redis for sessions, API responses, and frequently accessed data
- **Images**: Cloudinary for optimization and CDN delivery
- **Code**: Code splitting, lazy loading, service workers

## Security Requirements

- **RLS**: Implement on all tables
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Protect API endpoints
- **HTTPS**: All communications encrypted
- **CORS**: Properly configured cross-origin policies

## Deployment Workflow

1. **Local Development**: `npm run dev`
2. **Testing**: `npm run test` (unit + integration)
3. **Build**: `npm run build`
4. **Deploy**: Docker container to production
5. **CI/CD**: GitHub Actions with automated testing

## Key Files to Reference

- `/lib/services/` - Business logic patterns
- `/supabase/migrations/` - Database schema evolution
- `/middleware.ts` - Authentication patterns
- `/app/api/` - API route patterns
- `/components/ui/` - Reusable component library</content>
<parameter name="filePath">/Users/cerisonbrown/Documents/Bookingaboyfriend/.github/copilot-instructions.md
