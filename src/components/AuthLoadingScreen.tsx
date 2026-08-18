import type { ReactNode } from "react";
import LogoLight from "@/assets/imgs/logo/mel-logo.svg";

type AuthLoadingScreenProps = {
  message?: string;
  showSpinner?: boolean;
  action?: ReactNode;
};

function AuthLoadingScreen({
  message,
  showSpinner = true,
  action,
}: AuthLoadingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="flex flex-col items-center gap-0">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <img
            src={LogoLight}
            alt="Mel"
            className={`relative z-10 h-full w-full object-contain ${showSpinner ? "animate-pulse" : ""}`}
          />
        </div>
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          {showSpinner ? (
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
            </div>
          ) : null}
          {message ? (
            <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
          ) : null}
          {action}
        </div>
      </div>
    </div>
  );
}

export default AuthLoadingScreen;
