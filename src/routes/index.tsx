import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

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

function Logo() {
  return (
    <pre
      className="font-mono text-neutral-300 text-[8px] md:text-sm lg:text-base select-none"
      title="Digital Queer Collective"
    >
      {LOGO_ASCII_ART}
    </pre>
  );
}

function App() {
  return (
    <main className="h-dvh flex flex-col items-center justify-center gap-8">
      <Logo />
    </main>
  );
}
