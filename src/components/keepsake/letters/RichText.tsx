import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type Command = {
  label: string;
  icon: typeof Bold;
  run: () => void;
};

/**
 * A small, calm rich-text field. Only the handful of formats the Keepsake
 * needs; the body is sanitised again on the server before it is stored.
 */
export function RichText({
  value,
  onChange,
  placeholder = "Start writing…",
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
    // Only syncs when the value changes from outside (e.g. loading a draft).
  }, [value]);

  const exec = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    onChange(ref.current?.innerHTML ?? "");
  };

  const commands: Command[] = [
    { label: "Bold", icon: Bold, run: () => exec("bold") },
    { label: "Italic", icon: Italic, run: () => exec("italic") },
    { label: "Heading", icon: Heading2, run: () => exec("formatBlock", "<h2>") },
    { label: "Bulleted list", icon: List, run: () => exec("insertUnorderedList") },
    { label: "Numbered list", icon: ListOrdered, run: () => exec("insertOrderedList") },
    { label: "Quote", icon: Quote, run: () => exec("formatBlock", "<blockquote>") },
    {
      label: "Link",
      icon: Link2,
      run: () => {
        const url = window.prompt("Link address");
        if (url && /^https?:\/\//i.test(url)) exec("createLink", url);
      },
    },
  ];

  return (
    <div
      className={cn("rounded-[1.25rem] border border-rosegold/25 bg-white/60", className)}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-rosegold/20 px-2 py-2">
        {commands.map((command) => (
          <button
            key={command.label}
            type="button"
            title={command.label}
            aria-label={command.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={command.run}
            className="rounded-full p-2 text-ink/70 transition-colors hover:bg-rosegold/15 hover:text-rosegold"
          >
            <command.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Letter body"
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="letter-prose min-h-[11rem] w-full px-5 py-4 text-[0.98rem] leading-relaxed text-ink outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] sm:min-h-[16rem]"
      />
    </div>
  );
}
