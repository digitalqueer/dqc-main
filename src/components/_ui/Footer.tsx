import { Link as TanstackLink } from "@tanstack/react-router";
import { GaugeIcon, LogOutIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { auth_client } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Button from "./Button";
import Link from "./Link";

interface FooterProps extends ComponentProps<"footer"> {}

export default function Footer({ className, ...props }: FooterProps) {
  const session = auth_client.useSession();

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
        <div className="flex shrink-0 items-center gap-2 px-4 py-2">
          {session.data ? (
            <>
              <Link to="/dashboard">
                <GaugeIcon strokeWidth={1.5} size={16} />
                <span className="sr-only">Dashboard</span>
              </Link>
              {/* Also ends the session at DQC's provider, then comes back to "/". */}
              <Button onClick={() => auth_client.signOut({ callbackURL: "/" })}>
                <LogOutIcon strokeWidth={1.5} size={16} />
                <span className="sr-only">Sign Out</span>
              </Button>
            </>
          ) : (
            <TanstackLink to="/login" title="Sign in">
              <span aria-hidden>🏳️‍🌈</span>
              <span className="sr-only">Sign in</span>
            </TanstackLink>
          )}
        </div>
      </div>
    </footer>
  );
}
