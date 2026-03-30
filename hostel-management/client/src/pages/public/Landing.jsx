import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import UiIcon from '../../components/UiIcon';

const features = [
  { icon: '\u{1F6CF}\uFE0F', tone: 'blue', title: 'Room Management', desc: 'Automated allocation and real-time occupancy tracking.' },
  { icon: '\u{1F4B3}', tone: 'green', title: 'Fee Payments', desc: 'Integrated Razorpay payments with instant receipts.' },
  { icon: '\u{1F9FE}', tone: 'amber', title: 'Complaint Tracking', desc: 'Submit and track complaints with priority handling.' },
  { icon: '\u{1F37D}\uFE0F', tone: 'indigo', title: 'Food Menu', desc: 'Weekly menu updates with student feedback.' },
  { icon: '\u{1F9FA}', tone: 'slate', title: 'Laundry Service', desc: 'Regular and express laundry requests.' },
  { icon: '\u{1F6C2}', tone: 'violet', title: 'Pass Management', desc: 'Out pass and home pass with digital approvals.' },
];

const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Support', to: '/support' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white">
      <div className="pointer-events-none absolute inset-0 bg-slate-950/20" />

      <nav className="relative flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <BrandMark compact dark />
          <span className="text-lg font-bold tracking-tight text-white">Campus Nest</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-white text-primary-900 rounded-lg hover:bg-white/90 transition-colors">Register</Link>
        </div>
      </nav>

      <section className="relative max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-white/70 tracking-wide">Smart Campus Living</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Campus Nest
          <br />
          <span className="text-primary-400">Made Simple</span>
        </h1>
        <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
          A modern, digital system to manage rooms, fees, complaints, passes, and more for students and wardens alike.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">Get Started</Link>
          <Link to="/login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">Already have an account</Link>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-6 transition-colors">
              <div className="mb-4"><UiIcon label={feature.icon} tone={feature.tone} size="lg" /></div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-white/50">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-8 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandMark compact dark />
            <span className="text-sm font-bold text-white/80 tracking-tight">Campus Nest</span>
          </div>
          <p className="text-xs text-white/30">Copyright {new Date().getFullYear()} Campus Nest. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {footerLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="text-xs text-white/30 hover:text-white/60 transition-colors">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}