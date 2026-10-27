import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  /** What pressing the button does, in a sentence. */
  text: ReactNode;
  /** One button or link; it must accept a ref (any element, or `Button`). */
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
};

/**
 * A hint that appears after the pointer rests on a button.
 *
 * The delay is what makes it a hint and not noise: a merchant moving across
 * the panel sees nothing, one who pauses on a button they are unsure of is
 * told what it will do before pressing it.
 */
const Hint = ({ text, children, side = "top" }: Props) => (
  <Tooltip delayDuration={600}>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent
      side={side}
      sideOffset={6}
      dir="rtl"
      className="max-w-64 text-center text-[12px] leading-relaxed"
    >
      {text}
    </TooltipContent>
  </Tooltip>
);

export default Hint;
