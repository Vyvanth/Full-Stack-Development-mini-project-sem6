import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import roomIcon from '../../assets/icons/room.png';
import feeIcon from '../../assets/icons/fee.png';
import complaintIcon from '../../assets/icons/complaint.png';
import foodIcon from '../../assets/icons/food.png';
import laundryIcon from '../../assets/icons/laundry.png';
import passIcon from '../../assets/icons/pass.png';
import landingBg from '../../landing-bg.png';

const features = [
  { icon: roomIcon, title: 'Room Management', desc: 'Automated allocation and real-time occupancy tracking.' },
  { icon: feeIcon, title: 'Fee Payments', desc: 'Integrated Razorpay payments with instant receipts.' },
  { icon: complaintIcon, title: 'Complaint Tracking', desc: 'Submit and track complaints with priority handling.' },
  { icon: foodIcon, title: 'Food Menu', desc: 'Weekly menu updates with student feedback.' },
  { icon: laundryIcon, title: 'Laundry Service', desc: 'Regular and express laundry requests.' },
  { icon: passIcon, title: 'Pass Management', desc: 'Out pass and home pass with digital approvals.' },
];

const footerLinks = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms of Service', to: '/terms-of-service' },
  { label: 'Support', to: '/support' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#18212d_0%,#1f2a37_100%)] text-white">
        <div
          className="pointer-events-none absolute inset-0 bg-no-repeat bg-right-bottom bg-contain opacity-60"
          style={{ backgroundImage: `url(${landingBg})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(24,33,45,0.94)_0%,rgba(24,33,45,0.82)_34%,rgba(24,33,45,0.48)_62%,rgba(24,33,45,0.68)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_24%)]" />

        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <div className="flex items-center gap-3">
            <BrandMark compact dark />
            <div>
              <p className="text-lg font-bold tracking-tight text-white">Campus Nest</p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-300">Hostel Operations</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Register
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-4xl px-6 pb-40 pt-14 text-center lg:px-8 lg:pb-48 lg:pt-20">
          {/* UPDATED HEADING */}
          <h1
            className="text-6xl font-bold tracking-tight text-white drop-shadow-[0_10px_24px_rgba(15,23,42,0.28)] md:text-8xl"
          >
            Campus <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Nest</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A modern, digital system to manage rooms, fees, complaints, passes, and more for students and wardens alike.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Get Started {'\u2192'}
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto -mt-24 max-w-5xl px-6 pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
            >
              <div className="mb-5">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="h-14 w-14 object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[#18212d] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left lg:px-10">
          <div className="flex items-center gap-3">
            <BrandMark compact dark />
            <span className="text-sm font-bold tracking-tight text-white/85">Campus Nest</span>
          </div>

          <p className="text-xs text-white/35">
            Copyright {new Date().getFullYear()} Campus Nest. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {footerLinks.map(({ label, to }) => (
              <Link key={label} to={to} className="text-xs text-white/35 transition-colors hover:text-white/70">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
