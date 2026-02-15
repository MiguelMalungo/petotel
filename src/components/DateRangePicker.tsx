"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format } from "date-fns";
import { X } from "lucide-react";
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
        // Only close on click outside if on desktop (where it's not a modal)
        if (window.innerWidth >= 768) {
          setOpen(false);
        }
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
        <>
          {/* Mobile Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Calendar Container - Modal on Mobile, Popover on Desktop */}
          <div className="fixed bottom-0 left-0 right-0 z-[70] p-4 bg-white md:bg-surface border-t md:border border-border-custom rounded-t-2xl md:rounded-2xl shadow-2xl md:absolute md:top-full md:left-0 md:right-auto md:bottom-auto md:mt-2 md:z-50 md:w-auto md:min-w-[300px] flex flex-col md:block animate-in slide-in-from-bottom-10 md:animate-in md:fade-in md:zoom-in-95 duration-200">

            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h3 className="text-lg font-semibold text-foreground">Select Dates</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 text-text-secondary hover:text-foreground rounded-full hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center md:block overflow-hidden">
              <DayPicker
                mode="range"
                selected={{ from, to }}
                onSelect={(range) => {
                  onChange(range);
                  // Don't auto close on range selection start, only when both are selected? 
                  // Usually better to let user manually close on mobile or close only on full range.
                  // Existing logic:
                  if (range?.from && range?.to && window.innerWidth >= 768) {
                    setOpen(false);
                  }
                }}
                disabled={{ before: new Date() }}
                numberOfMonths={1} // Only 1 month on mobile for space
                modifiersClassNames={{
                  selected: "bg-accent text-white hover:bg-accent-hover",
                  range_start: "bg-accent text-white rounded-l-md",
                  range_end: "bg-accent text-white rounded-r-md",
                  range_middle: "bg-accent/20 text-foreground",
                  today: "text-accent font-bold"
                }}
                className="p-0 m-0"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
