import { ComponentProps } from "react";
import Link from "../_ui/Link";
import BlueskyIcon from "../icons/Bluesky";
import KoFiIcon from "../icons/KoFi";
import { cn } from "@/lib/utils";

export default function SupportRibbon(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("flex flex-wrap items-center gap-2", props.className)}
    >
      <Link
        href="https://bsky.app/profile/dqc.dev"
        target="_blank"
        className="no-underline"
      >
        <BlueskyIcon className="shrink-0" />
        <span>Follow Us on Bluesky</span>
      </Link>
      <Link
        href="https://ko-fi.com/digitalqueer"
        target="_blank"
        className="no-underline"
      >
        <KoFiIcon className="shrink-0" />
        <span>Support Us on Ko-Fi</span>
      </Link>
      {/*<Link href="https://dqc3.org" target="_blank" className="no-underline">
        <Building2Icon className="shrink-0" strokeWidth={1.5} size={16} />
        <span>View DQC3</span>
      </Link>*/}
    </div>
  );
}
