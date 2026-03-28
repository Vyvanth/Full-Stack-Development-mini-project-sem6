// src/pages/public/Support.jsx
import { Link } from 'react-router-dom';

const faqs = [
  {
    q: 'How do I register on HostelMS?',
    a: 'Click "Register" on the home page and fill in your details including your name, email, phone number, roll number, course, and branch. Once submitted, your account will be created and you can log in immediately.',
  },
  {
    q: 'I forgot my password. What should I do?',
    a: 'Contact your hostel administrator or warden to reset your password. They can update it from the admin panel. Alternatively, reach out to our support email and we will assist you.',
  },
  {
    q: 'How do I apply for an out-pass or home-pass?',
    a: 'Log in to your student dashboard and navigate to "Out Pass" or "Home Pass" from the sidebar. Fill in the required details and submit. Your warden will review and approve or reject the request.',
  },
  {
    q: 'How do I pay my hostel fee?',
    a: 'Go to the "Payments" section in your student dashboard. You will see your outstanding fees. Click "Pay Now" to proceed with payment via Razorpay. After successful payment, a receipt will be generated.',
  },
  {
    q: 'How do I file a complaint?',
    a: 'Navigate to the "Complaints" section in your dashboard. Select a category, describe your issue, and submit. You can track the status of your complaint from the same page.',
  },
  {
    q: 'My room has not been allocated. What should I do?',
    a: 'Room allocation is done by the hostel administrator. If your room is not showing, please contact your warden or administrator and request them to allocate a room from the admin panel.',
  },
  {
    q: 'Can I update my profile details?',
    a: 'Yes. Go to the "Profile" section in your student dashboard. You can update your phone number, guardian details, and address. Your roll number and course details can only be updated by an administrator.',
  },
];

const contactCards = [
  {
    icon: '📧',
    title: 'Email Support',
    desc: 'For general queries and account issues',
    value: 'support@hostelms.in',
    action: 'mailto:support@hostelms.in',
    label: 'Send an Email',
  },
  {
    icon: '📞',
    title: 'Phone Support',
    desc: 'Available Mon–Sat, 9 AM to 6 PM',
    value: '+91 98765 43210',
    action: 'tel:+919876543210',
    label: 'Call Now',
  },
  {
    icon: '🏢',
    title: 'Visit Us',
    desc: 'Hostel Administration Office',
    value: 'Ground Floor, Hostel Block A',
    action: null,
    label: null,
  },
];

export default function Support() {
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

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-widest mb-2">Help Centre</p>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">Support</h1>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed text-sm">
            Find answers to common questions or get in touch with our support team. We're here to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {contactCards.map((c) => (
            <div key={c.title} className="bg-white rounded-xl border border-slate-100 p-6 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">{c.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{c.desc}</p>
              <p className="text-sm font-medium text-slate-700 mb-3">{c.value}</p>
              {c.action && (
                <a href={c.action}
                  className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  {c.label}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Q. {faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-10 bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-slate-800 mb-1">Still need help?</p>
          <p className="text-sm text-slate-500 mb-4">If you couldn't find what you were looking for, email us directly and we'll get back to you within 24 hours.</p>
          <a href="mailto:support@hostelms.in"
            className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Email Support →
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-8 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} HostelMS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Terms of Service</Link>
            <Link to="/support" className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
