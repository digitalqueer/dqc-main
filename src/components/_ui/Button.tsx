import { cva, type VariantProps } from "class-variance-authority";
import { LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-2 border border-neutral-700 text-sm font-medium whitespace-nowrap transition-all duration-150 focus:outline disabled:pointer-events-none disabled:opacity-50 md:focus:outline-offset-2",
  {
    variants: {
      loading: {
        false: null,
        true: "relative text-transparent",
      },
      size: {
        default: "h-8 px-3",
        icon: "size-8 justify-center",
        sm: "h-6 px-2",
        lg: "text-md h-12 px-4",
      },
      variant: {
        default:
          "hover:bg-white hover:text-zinc-800 focus:bg-white focus:text-zinc-800 focus:outline-white",
        success:
          "border-emerald-200 hover:bg-emerald-300 hover:text-emerald-800 focus:bg-emerald-300 focus:text-emerald-800 focus:outline-emerald-300",
        /** Cautionary actions that can be taken back, e.g. Unpublish. */
        warning:
          "border-yellow-200 hover:bg-yellow-300 hover:text-yellow-800 focus:bg-yellow-300 focus:text-yellow-800 focus:outline-yellow-300",
        /** Destructive actions that can't be undone, e.g. confirming a delete. */
        danger:
          "border-rose-200 hover:bg-rose-300 hover:text-rose-800 focus:bg-rose-300 focus:text-rose-800 focus:outline-rose-300",
        /** No border until hovered or focused, for quiet actions in busy rows and toolbars. */
        ghost:
          "border-transparent hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export default function Button({
  children,
  className,
  loading,
  size,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ loading, variant, size, className }), {
        "cursor-pointer": typeof buttonVariants !== "undefined",
      })}
      type={type}
      disabled={props.disabled || !!loading}
    >
      {children}
      {loading && (
        <LoaderIcon
          size={20}
          strokeWidth={1.5}
          className="absolute inset-x-0 mx-auto animate-spin text-white"
        />
      )}
    </button>
  );
}
