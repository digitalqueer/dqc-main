import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { RotateCwIcon } from "lucide-react";
import Button from "./Button";
import Link from "./Link";
import Main from "./Main";

/**
 * Shown when a page's loader or component throws. Server functions throw
 * errors whose messages are written to be read here.
 */
export default function ErrorView({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <Main>
      <section role="alert" className="flex w-full flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-neutral-300 break-words">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              reset();
              void router.invalidate();
            }}
          >
            <RotateCwIcon strokeWidth={1.5} size={16} aria-hidden />
            Try again
          </Button>
          <Link to="/">Go home</Link>
        </div>
      </section>
    </Main>
  );
}
