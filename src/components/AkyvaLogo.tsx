import React from 'react';

interface AkyvaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const AkyvaLogo: React.FC<AkyvaLogoProps> = ({ size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className="flex items-center gap-3">
      {/* Dove Glyph with cyber wings */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0066FF] to-[#00E5FF] rounded-xl blur-[6px] opacity-75"></div>
        <div className="relative w-full h-full bg-[#0A0F1D] border border-[#00E5FF]/40 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5 text-[#00E5FF] transform -rotate-6 transition-transform group-hover:scale-110"
          >
            {/* Custom stylized messenger dove */}
            <path d="M12 4c-3.5 0-7 2.5-8 7 1.5-1 3.5-1.5 5-1.5 0 2.5 1.5 4.5 4 5 1-1.5 2-3 2.5-4.5 1.5 1 3.5 1.5 5 1.5C21 8 16.5 4 12 4z" fill="url(#doveGrad)" stroke="#00E5FF" />
            <path d="M7 11c-2 2-3 5-3 8 3-1 6-3 8-6" />
            <path d="M14 14.5c2 2.5 5 4 8 4.5-1-3-2-6-4.5-8" />
            <circle cx="15.5" cy="7.5" r="1" fill="#FFFFFF" />
            <defs>
              <linearGradient id="doveGrad" x1="4" y1="4" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00E5FF" stopOpacity="0.4" />
                <stop stopColor="#0066FF" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div>
        <div className={`font-black tracking-wider ${textSizes[size]} leading-none`}>
          <span className="bg-gradient-to-r from-white via-[#E2E8F0] to-[#00E5FF] bg-clip-text text-transparent">
            AKYVA
          </span>
        </div>
        {showTagline && (
          <div className="text-[10px] tracking-[0.25em] text-[#38BDF8] font-semibold uppercase mt-0.5">
            CONNECT BEYOND LANGUAGE
          </div>
        )}
      </div>
    </div>
  );
};
