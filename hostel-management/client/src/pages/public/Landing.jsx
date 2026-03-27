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

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        
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
      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm max-w-6xl mx-auto">
        Hostel Management System · Team 11 · Full Stack Development (22AIE457)
      </footer>
    </div>
  );
}
