import { useState, ReactNode } from "react";
import { cn } from "../lib/utils";

export function Redacted({ children, className }: { children: ReactNode; className?: string }) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <span
      className={cn(
        "relative inline-block cursor-help transition-colors duration-300",
        isRevealed ? "text-ink" : "text-transparent",
        className
      )}
      onMouseEnter={() => setIsRevealed(true)}
      onMouseLeave={() => setIsRevealed(false)}
    >
      <span
        className={cn(
          "absolute inset-0 bg-ink transition-all duration-300",
          isRevealed ? "h-[2px] top-auto bottom-0 opacity-20" : "h-full opacity-100"
        )}
      ></span>
      {children}
    </span>
  );
}
