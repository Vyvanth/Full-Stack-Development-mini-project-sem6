// src/pages/public/Landing.jsx
import { Link } from 'react-router-dom';

const features = [
  { icon: '🛏️', title: 'Room Management', desc: 'Automated allocation and real-time occupancy tracking.' },
  { icon: '💳', title: 'Fee Payments', desc: 'Integrated Razorpay payments with instant receipts.' },
  { icon: '📋', title: 'Complaint Tracking', desc: 'Submit and track complaints with priority handling.' },
  { icon: '🍽️', title: 'Food Menu', desc: 'Weekly menu updates with student feedback.' },
  { icon: '👕', title: 'Laundry Service', desc: 'Regular and express laundry requests.' },
  { icon: '✅', title: 'Pass Management', desc: 'Out pass and home pass with digital approvals.' },
];

const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Support', to: '/support' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏨</span>
          <span className="text-lg font-bold tracking-tight text-white">HostelMS</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-white text-primary-900 rounded-lg hover:bg-white/90 transition-colors">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70 tracking-wide">Smart Hostel Management</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Hostel Management<br />
          <span className="text-primary-400">Made Simple</span>
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
          A modern, digital system to manage rooms, fees, complaints, passes, and more — for students and wardens alike.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">
            Get Started →
          </Link>
          <Link to="/login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
            Already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-6 transition-colors">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🏨</span>
            <span className="text-sm font-bold text-white/80 tracking-tight">HostelMS</span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} HostelMS. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}