"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import DateRangePicker from "@/components/DateRangePicker";
import { Place } from "@/lib/types";
import {
  PawPrint,
  MapPin,
  Sparkles,
  ShieldCheck,
  ClipboardList,
  Search,
  ChevronDown,
} from "lucide-react";

type SearchMode = "destination" | "vibe";

const VIBE_SUGGESTIONS = [
  "Beachfront resort with dog park",
  "Countryside cabin pet friendly",
  "City hotel with pet spa",
  "Mountain lodge allows large dogs",
  "Boutique hotel cat friendly",
  "Family resort pets welcome",
];

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("destination");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [vibeQuery, setVibeQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 7),
    to: addDays(new Date(), 10),
  });
  const [adults, setAdults] = useState(2);
  const [petType, setPetType] = useState("dog");
  const [petCount, setPetCount] = useState(1);

  function handleSearch() {
    if (!dateRange?.from || !dateRange?.to) return;

    const params = new URLSearchParams({
      checkin: format(dateRange.from, "yyyy-MM-dd"),
      checkout: format(dateRange.to, "yyyy-MM-dd"),
      adults: String(adults),
      petType,
      petCount: String(petCount),
    });

    if (mode === "destination" && selectedPlace) {
      params.set("placeId", selectedPlace.placeId);
      params.set("placeName", selectedPlace.displayName);
    } else if (mode === "vibe" && vibeQuery.trim()) {
      params.set("vibeQuery", vibeQuery.trim());
    } else {
      return;
    }

    router.push(`/search?${params.toString()}`);
  }

  const canSearch =
    dateRange?.from &&
    dateRange?.to &&
    (mode === "destination" ? !!selectedPlace : vibeQuery.trim().length > 0);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[url('/media/heromobile.png')] md:bg-[url('/media/hero.png')]"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/[0.33]" />

        {/* Hero Content */}
        <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-8 lg:pt-24 lg:pb-12 min-h-[320px] lg:min-h-[500px]">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
              <PawPrint className="w-4 h-4" />
              <span>Pet-Friendly Hotels Only</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
              Travel with your
              <br />
              <span className="text-accent-light">best friend</span>
            </h1>
            <p className="text-base lg:text-lg text-white/85 max-w-xl mx-auto drop-shadow">
              Find hotels that welcome your furry companions. Every listing is
              verified pet-friendly with clear pet policies.
            </p>
          </div>
        </div>

        {/* Desktop Search Bar — anchored to bottom of hero (hidden on mobile) */}
        <div className="relative z-10 w-full hidden lg:block">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-3 px-4">
            <div className="inline-flex gap-1 bg-black/40 backdrop-blur-md rounded-full p-1">
              <button
                onClick={() => setMode("destination")}
                className={`py-2 px-5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === "destination"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Destination
              </button>
              <button
                onClick={() => setMode("vibe")}
                className={`py-2 px-5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === "vibe"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Vibe Search
              </button>
            </div>
          </div>

          {/* Vibe Suggestions (Desktop) */}
          {mode === "vibe" && !vibeQuery && (
            <div className="flex flex-wrap justify-center gap-2 mb-3 px-4">
              {VIBE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setVibeQuery(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Desktop Search Fields */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-row items-stretch gap-3">
              <div className="flex-[2] min-w-0">
                {mode === "destination" ? (
                  <PlacesAutocomplete
                    onSelect={setSelectedPlace}
                    selected={selectedPlace}
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder='e.g. "Beachfront resort with dog park"'
                      value={vibeQuery}
                      onChange={(e) => setVibeQuery(e.target.value)}
                      className="w-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all hover:border-accent/40"
                    />
                    <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
                      Describe your ideal stay
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-[1.5] min-w-0">
                <DateRangePicker
                  from={dateRange?.from}
                  to={dateRange?.to}
                  onChange={setDateRange}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-full">
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full h-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Adult" : "Adults"}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
                    Guests
                  </span>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-full">
                  <select
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    className="w-full h-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
                    Pet Type
                  </span>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-full">
                  <select
                    value={petCount}
                    onChange={(e) => setPetCount(Number(e.target.value))}
                    className="w-full h-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Pet" : "Pets"}
                      </option>
                    ))}
                  </select>
                  <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
                    Pets
                  </span>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                </div>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={handleSearch}
                  disabled={!canSearch}
                  className="h-full px-8 py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:cursor-not-allowed disabled:opacity-100 text-lg inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-5 h-5" />
                  Search Hotels
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Search Section — below the hero, clean card layout */}
      <div className="lg:hidden relative z-10 -mt-6" role="search" aria-label="Search pet-friendly hotels">
        <div className="mx-4 bg-surface rounded-2xl shadow-lg border border-border-custom p-4">
          <h2 className="sr-only">Find Pet-Friendly Hotels</h2>
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-surface-alt rounded-xl p-1 mb-4">
            <button
              onClick={() => setMode("destination")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "destination"
                ? "bg-white text-foreground shadow-sm"
                : "text-text-secondary"
                }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Destination
            </button>
            <button
              onClick={() => setMode("vibe")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${mode === "vibe"
                ? "bg-white text-foreground shadow-sm"
                : "text-text-secondary"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Vibe Search
            </button>
          </div>

          {/* Vibe Suggestions (Mobile) */}
          {mode === "vibe" && !vibeQuery && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {VIBE_SUGGESTIONS.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={() => setVibeQuery(s)}
                  className="text-xs px-2.5 py-1.5 rounded-full bg-surface-alt border border-border-custom text-text-secondary hover:bg-accent-bg hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* All fields stacked vertically */}
          <div className="flex flex-col gap-3">
            {/* Destination / Vibe Input */}
            {mode === "destination" ? (
              <PlacesAutocomplete
                onSelect={setSelectedPlace}
                selected={selectedPlace}
              />
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder='e.g. "Beachfront resort with dog park"'
                  value={vibeQuery}
                  onChange={(e) => setVibeQuery(e.target.value)}
                  className="w-full px-4 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all hover:border-accent/40"
                />
                <span className="absolute left-4 top-2.5 text-xs text-text-secondary">
                  Describe your ideal stay
                </span>
              </div>
            )}

            {/* Date Picker — full width */}
            <DateRangePicker
              from={dateRange?.from}
              to={dateRange?.to}
              onChange={setDateRange}
            />

            {/* Guests + Pet row — two columns */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full px-3 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Adult" : "Adults"}
                    </option>
                  ))}
                </select>
                <span className="absolute left-3 top-2.5 text-xs text-text-secondary">
                  Guests
                </span>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="w-full px-3 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </select>
                <span className="absolute left-3 top-2.5 text-xs text-text-secondary">
                  Pet Type
                </span>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={petCount}
                  onChange={(e) => setPetCount(Number(e.target.value))}
                  className="w-full px-3 py-3 pt-7 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 appearance-none cursor-pointer hover:border-accent/40 transition-all"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Pet" : "Pets"}
                    </option>
                  ))}
                </select>
                <span className="absolute left-3 top-2.5 text-xs text-text-secondary">
                  Pets
                </span>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              className="w-full py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Hotels
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">
          Why book with PetOtel?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <ShieldCheck className="w-10 h-10 text-accent" />,
              title: "Verified Pet-Friendly",
              desc: "Every hotel is checked for pet policies. No surprises at check-in.",
            },
            {
              icon: <ClipboardList className="w-10 h-10 text-accent" />,
              title: "Clear Pet Policies",
              desc: "See pet fees, size limits, and rules before you book.",
            },
            {
              icon: <Sparkles className="w-10 h-10 text-accent" />,
              title: "AI-Powered Search",
              desc: 'Search by vibe \u2014 try "cozy cabin that welcomes big dogs" and find the perfect match.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-surface rounded-2xl border border-border-custom p-6 text-center"
            >
              <div className="flex justify-center mb-4">{f.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
