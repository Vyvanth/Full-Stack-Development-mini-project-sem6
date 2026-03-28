// src/pages/public/PrivacyPolicy.jsx
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Information We Collect',
    content: `When you register on HostelMS, we collect personal information such as your full name, email address, phone number, roll number, course, and branch. We also collect usage data such as login times, actions performed within the platform, and device information to improve system performance and security.`,
  },
  {
    title: 'How We Use Your Information',
    content: `Your information is used solely to operate and improve the HostelMS platform. This includes room allocation, fee management, complaint tracking, pass approvals, and communication between students and administrators. We do not sell, rent, or share your personal data with any third-party organizations for marketing purposes.`,
  },
  {
    title: 'Data Storage & Security',
    content: `All data is stored securely in encrypted databases. Passwords are hashed using industry-standard algorithms and are never stored in plain text. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`,
  },
  {
    title: 'Cookies',
    content: `HostelMS uses session tokens stored in your browser's local storage to keep you signed in. We do not use third-party tracking cookies or advertising cookies. You can clear your browser storage at any time to log out of all sessions.`,
  },
  {
    title: 'Third-Party Services',
    content: `HostelMS integrates with Razorpay for payment processing. When you make a payment, your transaction data is handled by Razorpay in accordance with their privacy policy. We only store the payment status and receipt reference — we do not store card or bank details on our servers.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to access, update, or request deletion of your personal data at any time. To exercise these rights, please contact your hostel administrator or reach out to our support team. Account deletions will be processed within 7 working days.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date. Continued use of HostelMS after changes are posted constitutes your acceptance of the revised policy.`,
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-800">
            🏨 HostelMS
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Effective date: January 1, {new Date().getFullYear()}</p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            At HostelMS, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-3">
                {i + 1}. {s.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-600">
            Questions about this policy?{' '}
            <Link to="/support" className="text-primary-600 font-medium hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-8 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} HostelMS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link to="/support" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
