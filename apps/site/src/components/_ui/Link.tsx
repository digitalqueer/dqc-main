import {
  LinkComponentProps,
  Link as TanstackLink,
} from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./Button";
import { cn } from "@/lib/utils";

export type LinkProps = LinkComponentProps &
  VariantProps<typeof buttonVariants> & { children: ReactNode };

export default function Link({
  children,
  className,
  variant,
  size,
  ...props
}: LinkProps) {
  if ("href" in props) {
    return (
      <a
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <TanstackLink
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </TanstackLink>
  );
}
