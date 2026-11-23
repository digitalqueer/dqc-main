import { Link as TanstackLink } from "@tanstack/react-router";
import { HammerIcon, MenuIcon, RssIcon, UsersIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Dropdown from "./Dropdown";

interface HeaderProps extends ComponentProps<"header"> {
  title: string;
  onTitleRandomize: () => void;
}

export default function Header({
  title,
  onTitleRandomize,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn(
        "group sticky top-0 z-10 w-full backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <div className="container mx-auto flex max-w-4xl items-center gap-4 p-2 px-4">
        <Dropdown.Root>
          <Dropdown.Trigger size="icon">
            <MenuIcon strokeWidth={1.5} />
          </Dropdown.Trigger>
          <Dropdown.Content className="mt-2 gap-2! p-3">
            <Dropdown.Item as="link" to="/thoughts">
              <RssIcon strokeWidth={1.5} size={16} />
              <span>Thoughts</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/projects">
              <HammerIcon strokeWidth={1.5} size={16} />
              <span>Projects</span>
            </Dropdown.Item>
            <Dropdown.Item as="link" to="/about">
              <UsersIcon strokeWidth={1.5} size={16} />
              <span>About</span>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>

        <h1 className="font-bold lg:text-lg" title="Digital Queer Collective">
          <TanstackLink
            to="/"
            className="focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {title}
          </TanstackLink>
        </h1>
      </div>
    </header>
  );
}
