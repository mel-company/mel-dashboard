import type { ReactNode } from "react";
import melLogo from "@/assets/imgs/logo/mel-logo.svg";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** Short line under the Mel mark */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
};

/**
 * Shared chrome for /login and /otp — Mel mark first, navy field, cyan accent.
 * Replaces the generic blue→indigo card that both pages used to wear.
 */
const AuthShell = ({
  children,
  eyebrow = "لوحة تحكم المتجر",
  title,
  description,
  className,
}: Props) => {
  return (
    <div
      dir="rtl"
      className={cn(
        "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10",
        "bg-[#06091a] text-[#e4e7fc]",
        className,
      )}
    >
      {/* Atmosphere — soft brand washes, not a flat fill */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 85% -10%, rgba(87, 51, 234, 0.45), transparent 55%),
            radial-gradient(ellipse 70% 50% at -5% 100%, rgba(0, 183, 255, 0.28), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0, 255, 248, 0.06), transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(228,231,252,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(228,231,252,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <header className="mb-8 flex flex-col items-center text-center">
          <img
            src={melLogo}
            alt="Mel"
            className="mb-5 h-14 w-auto animate-[auth-mark-in_0.7s_ease-out_both] object-contain drop-shadow-[0_0_28px_rgba(0,183,255,0.35)]"
          />
          {eyebrow ? (
            <p className="mb-2 text-[12px] font-medium tracking-[0.18em] text-[#00b7ff]/90 uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="text-3xl font-bold tracking-tight text-white sm:text-[2rem]"
            style={{ fontFamily: "var(--font-family-table)" }}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[#a4b1fa]">
              {description}
            </p>
          ) : null}
        </header>

        <div className="animate-[auth-panel-in_0.55s_ease-out_0.08s_both] rounded-[28px] border border-white/8 bg-[#0a0e27]/80 p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:p-7">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes auth-mark-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: none; }
        }
        @keyframes auth-panel-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default AuthShell;
