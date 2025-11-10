# Booking a Boyfriend - Enterprise Platform

[![CI/CD](https://github.com/your-org/booking-a-boyfriend/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/your-org/booking-a-boyfriend/actions/workflows/ci-cd.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

Enterprise-grade male companion booking platform with real-time communication, secure payments, and comprehensive business analytics.

## 🚀 Features

- **Secure Authentication**: Supabase Auth with JWT tokens and user role management
- **Real-time Messaging**: WebSocket-based messaging with conversation tracking
- **Secure Payments**: Stripe integration with PCI DSS compliance
- **Advanced Analytics**: Comprehensive business intelligence and user behavior tracking
- **Verification System**: Multi-step verification process for boyfriends
- **Review & Rating**: Verified review system with detailed feedback
- **Admin Dashboard**: Complete administrative control panel
- **Mobile Responsive**: Optimized for all device types
- **Multi-language**: Internationalization support
- **Performance Optimized**: CDN, caching, and database optimization

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Real-time**: Supabase Realtime
- **Caching**: Redis
- **Storage**: Cloudinary
- **Monitoring**: Sentry
- **Analytics**: Plausible

### Directory Structure

```
├── app/                    # Next.js 15 app directory
│   ├── (authenticated)/   # Protected routes
│   ├── (public)/         # Public routes
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── services/         # Business logic services
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
├── supabase/             # Database migrations and config
├── public/               # Static assets
├── tests/                # Test suites
└── types/                # TypeScript type definitions
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker & Docker Compose (for local development)
- Supabase account
- Stripe account
- Redis (local or cloud)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/booking-a-boyfriend.git
   cd booking-a-boyfriend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

4. **Database setup**
   ```bash
   # Start Supabase locally
   npm run supabase:start

   # Run migrations
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Using Docker (alternative)**
   ```bash
   docker-compose up -d
   ```

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking

# Database
npm run db:generate      # Generate TypeScript types
npm run db:push          # Push migrations to database
npm run db:reset         # Reset database

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Supabase
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables. Key configurations:

- **Supabase**: Database and authentication
- **Stripe**: Payment processing
- **Redis**: Caching and sessions
- **Cloudinary**: Image storage and optimization
- **Sentry**: Error monitoring
- **Plausible**: Analytics

### Database Schema

The application uses PostgreSQL with the following main tables:

- `profiles` - User profiles (extends auth.users)
- `boyfriends` - Boyfriend-specific data
- `bookings` - Booking transactions
- `messages` - Real-time messaging
- `conversations` - Message threads
- `reviews` - User reviews and ratings

All tables have Row Level Security (RLS) policies implemented.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npx playwright test
```

### Test Structure

- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Full user workflows with Playwright

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Using Docker**
   ```bash
   docker build -t booking-boyfriend .
   docker run -p 3000:3000 booking-boyfriend
   ```

3. **Environment Setup**
   - Configure production environment variables
   - Set up PostgreSQL database
   - Configure Redis instance
   - Set up Stripe webhooks
   - Configure Cloudinary account

### CI/CD

The project includes GitHub Actions workflows for:

- Automated testing on pull requests
- Code quality checks
- Security scanning
- Automated deployment to staging/production

## 🔒 Security

- **Authentication**: JWT-based with secure session management
- **Authorization**: Role-based access control (client, boyfriend, admin)
- **Data Protection**: Row Level Security on all database tables
- **Payment Security**: PCI DSS compliant with Stripe
- **Input Validation**: Comprehensive validation on all user inputs
- **Rate Limiting**: API endpoint protection
- **HTTPS**: Enforced on all communications

## 📊 Monitoring & Analytics

- **Error Tracking**: Sentry integration for real-time error monitoring
- **Performance**: Built-in performance monitoring
- **Analytics**: Plausible for privacy-focused analytics
- **Business Metrics**: Comprehensive dashboard with key performance indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📞 Support

For support, email support@bookingaboyfriend.com or join our Discord community.

---

**Built with ❤️ for the modern dating economy**
