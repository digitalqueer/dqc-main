import type { LinkComponentProps } from "@tanstack/react-router";
import Link from "./Link";

interface DefinitionProps {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  link?: {
    label: string;
    to: LinkComponentProps["to"];
  };
}

export default function Definition({
  word,
  pronunciation,
  partOfSpeech,
  definition,
  link,
}: DefinitionProps) {
  return (
    <section className="flex flex-col border p-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="m-0!">{word}</h3>
          <p className="m-0! text-sm text-neutral-400">/{pronunciation}/</p>
        </div>
        {link && <Link to={link.to}>{link.label}</Link>}
      </div>
      <p className="m-1! text-sm text-neutral-400 italic">{partOfSpeech}</p>
      <p className="m-0! mx-1! mt-3!">{definition}</p>
    </section>
  );
}
