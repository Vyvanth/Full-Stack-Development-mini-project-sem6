// src/pages/public/TermsOfService.jsx
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Acceptance of Terms',
    content: `By accessing or using HostelMS, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. These terms apply to all users including students, wardens, and administrators.`,
  },
  {
    title: 'User Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with anyone. You must notify your hostel administrator immediately if you suspect unauthorized access to your account. HostelMS is not liable for any loss resulting from unauthorized use of your account.`,
  },
  {
    title: 'Acceptable Use',
    content: `You agree to use HostelMS only for its intended purposes — managing hostel-related activities such as room bookings, fee payments, complaints, and pass requests. You must not misuse the platform, submit false information, attempt to manipulate the system, or engage in any activity that disrupts normal operations.`,
  },
  {
    title: 'Payments',
    content: `All fee payments processed through HostelMS are handled via Razorpay, a third-party payment gateway. Once a payment is initiated, it is subject to Razorpay's terms and conditions. HostelMS is not responsible for payment failures due to issues with your bank or Razorpay's systems. Refunds, if applicable, are subject to the hostel's refund policy.`,
  },
  {
    title: 'Pass Requests & Complaints',
    content: `Pass requests (out-pass and home-pass) submitted through HostelMS are subject to approval by the warden or administrator. Approval is not guaranteed and is at the sole discretion of the hostel management. Complaints submitted must be genuine and relevant. Filing false or malicious complaints may result in disciplinary action.`,
  },
  {
    title: 'Intellectual Property',
    content: `All content, branding, and software associated with HostelMS are the intellectual property of the platform developers. You may not copy, reproduce, distribute, or create derivative works from any part of the platform without prior written consent.`,
  },
  {
    title: 'Termination',
    content: `HostelMS reserves the right to suspend or terminate your account at any time if you are found to be in violation of these terms. Upon termination, your access to the platform will be revoked and your data may be archived or deleted in accordance with our Privacy Policy.`,
  },
  {
    title: 'Limitation of Liability',
    content: `HostelMS is provided on an "as is" basis. We do not guarantee uninterrupted or error-free service. To the fullest extent permitted by law, HostelMS shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the platform.`,
  },
  {
    title: 'Changes to Terms',
    content: `We reserve the right to modify these Terms of Service at any time. Updated terms will be posted on this page. Continued use of HostelMS after changes are published constitutes your acceptance of the revised terms.`,
  },
];

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Terms of Service</h1>
          <p className="text-sm text-slate-400">Effective date: January 1, {new Date().getFullYear()}</p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Please read these Terms of Service carefully before using the HostelMS platform. By using HostelMS, you agree to comply with and be bound by the following terms and conditions.
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
            Have questions about these terms?{' '}
            <Link to="/support" className="text-primary-600 font-medium hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-8 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} HostelMS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">Terms of Service</Link>
            <Link to="/support" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
