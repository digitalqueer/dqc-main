import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

interface FooterProps extends ComponentProps<"footer"> {}

export default function Footer({ className, ...props }: FooterProps) {
  return (
    <footer
      className={cn("group container mx-auto mb-4 max-w-4xl p-2", className)}
      {...props}
    >
      <div className="flex w-full">
        <div className="flex grow items-center p-2 px-4">
          <p className="grow text-sm">
            © 2026. DigitalQueer LLC. All Rights Reserved.
          </p>
        </div>
        <div className="flex shrink-0 items-center px-4 py-2">
          <p>🏳️‍🌈</p>
        </div>
      </div>
    </footer>
  );
}
