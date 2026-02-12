"use client";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ percentage, size = 72, strokeWidth = 4 }: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center py-4 pb-5 mb-4"
      role="img"
      aria-label={`Progression globale : ${percentage}%`}
    >
      <div className="relative mb-2" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size + 8} ${size + 8}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={(size + 8) / 2}
            cy={(size + 8) / 2}
            r={radius}
            fill="none"
            stroke="var(--border-glass)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={(size + 8) / 2}
            cy={(size + 8) / 2}
            r={radius}
            fill="none"
            className="ring-gradient"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-base font-bold tracking-tight">
          {percentage}%
        </div>
      </div>
      <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Progression globale</span>
    </div>
  );
}
