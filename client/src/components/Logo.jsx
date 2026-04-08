export default function Logo({ size = 'md', showName = true }) {
  const scales = { sm: 0.55, md: 0.85, lg: 1.2 };
  const sc = scales[size] || 0.85;
  const textSizes = { sm: 12, md: 16, lg: 22 };
  const ts = textSizes[size] || 16;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg
        className="logo-glow logo-float"
        width={Math.round(120 * sc)}
        height={Math.round(68 * sc)}
        viewBox="0 0 120 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LEFT star — small, tilted -12° */}
        <g transform="translate(18,34) rotate(-12)">
          <path
            d="M0,-20 L3.5,-3.5 L20,0 L3.5,3.5 L0,20 L-3.5,3.5 L-20,0 L-3.5,-3.5 Z"
            fill="none" stroke="#5de8b8" strokeWidth="1.7" strokeLinejoin="round"
          />
        </g>
        {/* CENTER star — large, rotated 45° (cross/plus orientation) */}
        <g transform="translate(60,34) rotate(45)">
          <path
            d="M0,-28 L5,-5 L28,0 L5,5 L0,28 L-5,5 L-28,0 L-5,-5 Z"
            fill="none" stroke="#5de8b8" strokeWidth="2" strokeLinejoin="round"
          />
        </g>
        {/* RIGHT star — medium, tilted +10° */}
        <g transform="translate(102,34) rotate(10)">
          <path
            d="M0,-21 L3.5,-3.5 L21,0 L3.5,3.5 L0,21 L-3.5,3.5 L-21,0 L-3.5,-3.5 Z"
            fill="none" stroke="#5de8b8" strokeWidth="1.7" strokeLinejoin="round"
          />
        </g>
      </svg>

      {showName && (
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: ts,
          fontWeight: 700,
          letterSpacing: 4,
          color: '#d4f5e8',
          whiteSpace: 'nowrap',
        }}>
          WATCH<span style={{ color: '#5de8b8' }}>X</span>TOGETHER
        </span>
      )}
    </div>
  );
}
