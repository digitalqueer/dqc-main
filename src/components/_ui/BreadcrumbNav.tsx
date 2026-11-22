// The trail at the top of an admin page:
//
//   <BreadcrumbNav current_page_label="Contact Requests">
//     <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
//   </BreadcrumbNav>
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";
import Link, { type LinkProps } from "./Link";

/** A page above this one; render inside a BreadcrumbNav. */
function BreadcrumbItem({ children, ...props }: LinkProps) {
  return (
    <li className="flex items-center gap-2">
      <Link size="sm" {...props}>
        {children}
      </Link>
      <ChevronRightIcon strokeWidth={1.5} size={16} aria-hidden />
    </li>
  );
}

interface BreadcrumbNavProps extends ComponentProps<"nav"> {
  current_page_label: string;
}

function BreadcrumbNav({
  children,
  className,
  current_page_label,
  ...props
}: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumbs" className={cn("-ml-2", className)} {...props}>
      <ol className="flex flex-wrap items-center gap-2">
        {children}
        <li>
          <span
            aria-current="page"
            className={buttonVariants({
              size: "sm",
              variant: "ghost",
              className: "pointer-events-none text-neutral-300",
            })}
          >
            {current_page_label}
          </span>
        </li>
      </ol>
    </nav>
  );
}

export { BreadcrumbItem, BreadcrumbNav };
