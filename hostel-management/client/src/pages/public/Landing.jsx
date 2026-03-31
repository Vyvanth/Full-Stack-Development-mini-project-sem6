import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark';
import roomIcon from '../../assets/icons/room.png';
import feeIcon from '../../assets/icons/fee.png';
import complaintIcon from '../../assets/icons/complaint.png';
import foodIcon from '../../assets/icons/food.png';
import laundryIcon from '../../assets/icons/laundry.png';
import passIcon from '../../assets/icons/pass.png';

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
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(148,163,184,0.12),transparent_24%)]" />

        <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6 lg:px-8">
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
          <span className="inline-flex rounded-full border border-white/12 bg-white/6 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">
            Campus Nest
          </span>

          <h1 className="mt-7 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Hostel Management, Made Clear
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A modern, digital system to manage rooms, fees, complaints, passes, and more for students and wardens alike.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/18 bg-transparent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/8"
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
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
            >
              <div className="mb-5">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="h-14 w-14 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-[linear-gradient(180deg,#18212d_0%,#1f2a37_100%)] text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left lg:px-8">
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
