import React from 'react';

export default function SocialPlatformIcon({ platform }) {
  switch (platform) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.3" cy="6.8" r="1.25" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14.3 4.25c.45 1.28 1.39 2.38 2.62 3.02 1.06.56 2.26.77 3.33.61v2.93a7.44 7.44 0 0 1-3.03-.56v5.11a5.94 5.94 0 1 1-5.94-5.94c.31 0 .62.03.92.08v3.02a2.92 2.92 0 1 0 2 2.78V4.25h.1Z" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.2 8.2a2.8 2.8 0 0 0-1.97-1.98C17.52 5.75 12 5.75 12 5.75s-5.52 0-7.23.47A2.8 2.8 0 0 0 2.8 8.2 29.4 29.4 0 0 0 2.33 12c0 1.28.16 2.55.47 3.8a2.8 2.8 0 0 0 1.97 1.98c1.71.47 7.23.47 7.23.47s5.52 0 7.23-.47a2.8 2.8 0 0 0 1.97-1.98c.31-1.25.47-2.52.47-3.8 0-1.28-.16-2.55-.47-3.8ZM10.25 15.16V8.84L15.5 12l-5.25 3.16Z" fill="currentColor" />
        </svg>
      );
    case 'website':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm5.95 7.5h-3.17a13.32 13.32 0 0 0-1.18-4.02A6.55 6.55 0 0 1 17.95 11Zm-5.95 7.55c-.63 0-1.76-1.74-2.14-4.55h4.28c-.38 2.81-1.51 4.55-2.14 4.55Zm-2.3-6.55c-.05-.49-.08-.99-.08-1.5s.03-1.01.08-1.5h4.6c.05.49.08.99.08 1.5s-.03 1.01-.08 1.5H9.7Zm-4.65 0c-.07-.49-.1-.99-.1-1.5s.03-1.01.1-1.5h3.18c-.05.49-.08.99-.08 1.5s.03 1.01.08 1.5H5.05Zm1-4.02A6.55 6.55 0 0 1 10.4 6.98 13.32 13.32 0 0 0 9.22 11H6.05Zm0 7.02h3.17c.23 1.45.64 2.83 1.18 4.02A6.55 6.55 0 0 1 6.05 15Zm7.55 4.02c.54-1.19.95-2.57 1.18-4.02h3.17a6.55 6.55 0 0 1-4.35 4.02Z" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}
