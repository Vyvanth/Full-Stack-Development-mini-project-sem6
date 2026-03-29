const TONES = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-rose-100 text-rose-700',
  violet: 'bg-violet-100 text-violet-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

export default function UiIcon({ label, tone = 'slate', size = 'md', dark = false }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm rounded-md',
    md: 'w-10 h-10 text-lg rounded-lg',
    lg: 'w-12 h-12 text-xl rounded-xl',
  };

  const palette = dark ? 'bg-white/10 text-white ring-1 ring-white/15' : TONES[tone] || TONES.slate;

  return (
    <span
      className={`inline-flex items-center justify-center leading-none shadow-sm ${sizes[size]} ${palette}`}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}

