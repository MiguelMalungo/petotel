"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface Props {
  from: Date | undefined;
  to: Date | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export default function DateRangePicker({ from, to, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label =
    from && to
      ? `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`
      : "Select dates";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all hover:border-accent/40"
      >
        <span className="block text-xs text-text-secondary mb-0.5">
          Check-in / Check-out
        </span>
        <span className={from ? "text-foreground" : "text-warm-gray"}>
          {label}
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 bg-surface border border-border-custom rounded-2xl shadow-xl p-4 z-50">
          <DayPicker
            mode="range"
            selected={{ from, to }}
            onSelect={(range) => {
              onChange(range);
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            disabled={{ before: new Date() }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}
