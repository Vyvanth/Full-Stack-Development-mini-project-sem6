export default function BrandMark({ dark = false, compact = false }) {
  const size = compact ? 'w-8 h-8' : 'w-10 h-10';
  const ring = dark ? 'drop-shadow-[0_0_0_rgba(0,0,0,0)]' : 'drop-shadow-sm';

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${size} ${ring}`}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="campusNestBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="campusNestOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      <path
        d="M14 30.5V24.8c0-1.5.6-2.9 1.7-4L29.1 8.2a4.2 4.2 0 0 1 5.8 0l13.4 12.6A5.7 5.7 0 0 1 50 24.8v17.7c-5.8 4.6-15.8 4.5-22 .3l-3.8-2.6c-2.9-2-6.3-3.2-10.2-3.7V30.5Z"
        fill="none"
        stroke="url(#campusNestBlue)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="27.5" y="24" width="6" height="6" rx="1.2" fill="url(#campusNestBlue)" />
      <rect x="35.5" y="24" width="6" height="6" rx="1.2" fill="url(#campusNestBlue)" />
      <rect x="27.5" y="32" width="6" height="6" rx="1.2" fill="url(#campusNestBlue)" />
      <rect x="35.5" y="32" width="6" height="6" rx="1.2" fill="url(#campusNestBlue)" />

      <path
        d="M10 36c9.5 0 12.7 2.1 17.2 5.4 5 3.6 10.8 6.3 18.2 6.3 5.3 0 9.2-1.1 13.6-3.7-4.8 8.5-13.7 13.8-24.7 13.8C20 57.8 10.2 47.8 10 36Z"
        fill="url(#campusNestOrange)"
      />
      <path
        d="M18.8 48.8c4 2.2 8.5 3.3 13.8 3.3 9.8 0 17.9-3.7 24.2-11.1-2.3 8-10.8 16.8-24.3 16.8-5.5 0-10.2-1.1-13.7-3.1Z"
        fill="url(#campusNestOrange)"
      />
    </svg>
  );
}

