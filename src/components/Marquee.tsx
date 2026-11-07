import { cn } from "../lib/utils";

export function Marquee({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden whitespace-nowrap bg-accent text-white py-2 flex", className)}>
      <div className="animate-marquee inline-block font-mono font-bold tracking-widest text-sm uppercase">
        {text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;
      </div>
      <div className="animate-marquee inline-block font-mono font-bold tracking-widest text-sm uppercase" aria-hidden="true">
        {text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;{text}&nbsp;
      </div>
    </div>
  );
}
