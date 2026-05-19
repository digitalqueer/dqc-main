import {
  HammerIcon,
  MenuIcon,
  RssIcon,
  UsersIcon,
  WandIcon,
} from "lucide-react";
import Button from "./Button";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Dropdown from "./Dropdown";
import { Link as TanstackLink } from "@tanstack/react-router";

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
        "group container sticky top-0 mx-auto max-w-4xl p-2 px-4 flex items-center gap-4",
        className,
      )}
      {...props}
    >
      <Dropdown.Root>
        <Dropdown.Trigger size="icon">
          <MenuIcon strokeWidth={1.5} />
        </Dropdown.Trigger>
        <Dropdown.Content className="p-3 gap-2! mt-2">
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
          className="focus-visible:outline-1 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {title}
        </TanstackLink>
      </h1>
    </header>
  );
}
