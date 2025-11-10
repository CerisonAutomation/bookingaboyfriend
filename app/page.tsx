import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary-900 mb-6">
            Booking a Boyfriend
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Enterprise-grade male companion booking platform with real-time communication,
            secure payments, and comprehensive business analytics.
          </p>
          <div className="space-x-4">
            <Link
              href="/browse"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Boyfriends
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-secondary-50 text-primary-600 border border-primary-200 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold text-primary-900 mb-3">Secure Payments</h3>
            <p className="text-secondary-600">
              PCI DSS compliant payment processing with Stripe integration and fraud protection.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold text-primary-900 mb-3">Real-time Messaging</h3>
            <p className="text-secondary-600">
              Instant communication with WebSocket-based messaging and live updates.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-soft">
            <h3 className="text-xl font-semibold text-primary-900 mb-3">Verified Profiles</h3>
            <p className="text-secondary-600">
              Comprehensive verification process ensuring quality and safety for all users.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
