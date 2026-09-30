import { AlertTriangle, CheckCircle2, Clock3, HelpCircle } from "lucide-react";

export type StatusTone = "pending" | "progress" | "done" | "alert";

/**
 * Figma's status pills carry a small state glyph beside the label — ✓ for a
 * settled state, ⚠ for a problem, a clock while in flight, ? for unknown.
 * Products and orders were rendering the pill without it.
 */
const StatusGlyph = ({ tone }: { tone?: StatusTone }) => {
  if (!tone) return null;
  const className = "size-3.5 shrink-0";
  if (tone === "done") return <CheckCircle2 className={className} />;
  if (tone === "alert") return <AlertTriangle className={className} />;
  if (tone === "progress") return <Clock3 className={className} />;
  return <HelpCircle className={className} />;
};

export default StatusGlyph;
