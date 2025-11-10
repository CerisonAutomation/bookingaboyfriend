# BookingABoyfriend

**Enterprise-grade male companion booking platform with premium verification, AI-powered matching, and luxury experiences.**

🔐 Bank-level security | ✓ AI matching | 💎 Premium experiences | 🌍 Global reach

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3001
```

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Environment variables configured

## 🏗️ Project Structure

```
bookingaboyfriend/
├── app/                    # Next.js App Router
│   ├── page.js            # Homepage
│   ├── layout.js          # Root layout
│   └── api/               # API endpoints
├── lib/                   # Business logic & utilities
│   ├── config/            # Configuration
│   ├── hooks/             # React hooks
│   ├── services/          # External service integrations
│   ├── supabase/          # Database client
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── components/            # React components
├── public/                # Static assets
├── supabase/              # Database migrations
└── docs/                  # Documentation
```

## ⚙️ Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your environment variables for:
- Supabase (authentication & database)
- Stripe (payments)
- External APIs (OpenAI, Google Cloud, etc.)

## 🗄️ Database

Initialize Supabase:

```bash
npm run supabase:start
npm run db:push
```

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📦 Build & Deploy

```bash
npm run build         # Production build
npm start             # Start production server
```

## 📚 Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Security](docs/architecture/SECURITY_AUDIT_REPORT.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push and create a Pull Request

## 📄 License

Private - All rights reserved

## 💬 Support

For support, email support@bookingaboyfriend.com

---

Built with ❤️ using Next.js, React, TypeScript, and Supabase
