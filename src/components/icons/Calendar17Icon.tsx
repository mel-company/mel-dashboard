import { cn } from "@/lib/utils";

type Calendar17IconProps = {
  className?: string;
  size?: number;
};

/** Figma calendar icon with day "17" */
const Calendar17Icon = ({ className, size = 24 }: Calendar17IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      {/* Soft tile */}
      <rect x="3" y="4.5" width="18" height="16" rx="4" fill="#E8ECF2" />
      {/* Binder pins */}
      <rect x="7.5" y="2.5" width="2" height="4" rx="1" fill="#2F3A4A" />
      <rect x="14.5" y="2.5" width="2" height="4" rx="1" fill="#2F3A4A" />
      {/* Header bar */}
      <rect x="5.5" y="7" width="13" height="2.25" rx="1" fill="#2F3A4A" />
      {/* Day number */}
      <text
        x="12"
        y="18.2"
        textAnchor="middle"
        fill="#2F3A4A"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        17
      </text>
    </svg>
  );
};

export default Calendar17Icon;
