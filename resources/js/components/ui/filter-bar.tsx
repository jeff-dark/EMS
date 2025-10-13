import React from "react";

interface FilterBarProps {
  children?: React.ReactNode;
  onReset?: () => void;
  className?: string;
  right?: React.ReactNode;
}

// Simple layout wrapper for page-level filters. Keeps spacing and responsive grid consistent across pages.
export default function FilterBar({ children, onReset, className = "", right }: FilterBarProps) {
  return (
    <div className={`m-4 rounded-md border bg-background p-3 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {right}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
