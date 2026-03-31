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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#111827_0%,#1f2937_52%,#0f172a_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_24%)]" />

      <nav className="relative flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <BrandMark compact dark />
          <div>
            <span className="block text-lg font-bold tracking-tight text-white">Campus Nest</span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-300">Hostel Operations</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-white text-slate-900 rounded-xl shadow-[0_12px_28px_rgba(15,23,42,0.2)] hover:bg-slate-100 transition-all">Register</Link>
        </div>
      </nav>

      <section className="relative max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.08]">
          <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm font-semibold tracking-[0.22em] uppercase text-slate-200 mb-6">
            Campus Nest
          </span>
          <br />
          Hostel Management, Made Clear
        </h1>
        <p className="text-[17px] text-white/68 mb-10 max-w-2xl mx-auto leading-8">
          A modern, digital system to manage rooms, fees, complaints, passes, and more for students and wardens alike.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl shadow-[0_18px_36px_rgba(15,23,42,0.22)] transition-all">Get Started</Link>
          <Link to="/login" className="px-6 py-3 bg-white/8 border border-white/12 hover:bg-white/14 text-white font-medium rounded-2xl transition-all">Already have an account</Link>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white/6 hover:bg-white/10 border border-white/10 rounded-3xl p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-sm transition-all hover:-translate-y-0.5">
              <div className="mb-4"><UiIcon label={feature.icon} tone={feature.tone} size="lg" /></div>
              <h3 className="font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-7">{feature.desc}</p>
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
