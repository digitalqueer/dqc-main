import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Link from "./Link";
import Main from "./Main";

const LOGO_ASCII_ART = `
0000000000000         0000000000000        000000000000
0000000000000000    00000000000000000   000000000000000000
0000       0000000000000        0000000000000        000000
0000          00000000             00000000            00000
0000           000000               000000              0
0000           00000                00000
0000            0000                00000
0000           00000                00000
0000           000000               000000              000
0000          000000000           000000000            00000
0000        0000000000000       0000   000000        000000
0000000000000000    00000000000000000000000000000000000000
0000000000000          00000000000000000   000000000000
`;

function Logo({
  className,
  ...props
}: Omit<ComponentProps<"pre">, "children">) {
  return (
    <pre
      {...props}
      className={cn(
        "text-[8px] text-neutral-300 select-none md:text-sm lg:text-base",
        className,
      )}
      title="Digital Queer Collective"
    >
      {LOGO_ASCII_ART}
    </pre>
  );
}

export default function NotFound() {
  return (
    <Main>
      <div className="flex w-full flex-col items-center gap-4">
        <p>There is no such page.</p>
        <Link to="/">Go home</Link>
        <Logo />
      </div>
    </Main>
  );
}
