export default function BrandMark({ dark = false, compact = false }) {
  const size = compact ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  const palette = dark
    ? 'bg-white/10 text-white ring-1 ring-white/15'
    : 'bg-primary-600 text-white shadow-sm';

  return (
    <span
      className={`inline-flex ${size} items-center justify-center rounded-xl font-bold tracking-[0.24em] ${palette}`}
      aria-hidden="true"
    >
      HM
    </span>
  );
}
