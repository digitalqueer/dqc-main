import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { CONTROL_CLASSES, SINGLE_LINE_CONTROL_HEIGHT } from "./InputField";

interface SelectProps extends ComponentProps<"select"> {
  /** Classes for the wrapper (e.g. width or margins); `className` styles the <select>. */
  wrapper_className?: string;
}

/**
 * Native <select> with its own chevron. The browser's arrow is hidden
 * (appearance-none) because browsers place it differently and padding doesn't
 * move it everywhere; this one always sits 8px from the right edge.
 */
export function Select({
  className,
  wrapper_className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", wrapper_className)}>
      <select
        {...props}
        className={cn(
          CONTROL_CLASSES,
          // pr-8 keeps option text clear of the 16px chevron and its 8px inset.
          "peer appearance-none pr-8",
          SINGLE_LINE_CONTROL_HEIGHT,
          className,
        )}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        strokeWidth={1.5}
        size={16}
        className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 peer-disabled:opacity-60"
      />
    </div>
  );
}
