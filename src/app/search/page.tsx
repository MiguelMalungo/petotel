"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import HotelCardSkeleton from "@/components/HotelCardSkeleton";
import { HotelRateData, HotelBrief, HotelDetail } from "@/lib/types";
import {
  PawPrint,
  ArrowLeft,
  Building2,
  ArrowRight,
} from "lucide-react";

// SEO: Dynamic page title is handled via useEffect in the client component

interface HotelCard {
  hotelId: string;
  name: string;
  photo: string;
  address: string;
  rating: number;
  price: number;
  currency: string;
  tags?: string[];
  story?: string;
  petPolicy?: string;
  refundable: boolean;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = Number(searchParams.get("adults") || 2);
  const placeId = searchParams.get("placeId");
  const placeName = searchParams.get("placeName");
  const vibeQuery = searchParams.get("vibeQuery");
  const petType = searchParams.get("petType") || "dog";
  const petCount = searchParams.get("petCount") || "1";

  const [hotels, setHotels] = useState<HotelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteringMsg, setFilteringMsg] = useState("");
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError("");
    setFilteringMsg("");
    setHotels([]);

    try {
      // Build the rates request body
      // Use facility ID 4 ("Pets allowed") to pre-filter at the API level
      const body: Record<string, unknown> = {
        occupancies: [{ adults }],
        currency: "USD",
        guestNationality: "US",
        checkin,
        checkout,
        roomMapping: true,
        maxRatesPerHotel: 1,
        includeHotelData: true,
        facilities: [4], // 4 = "Pets allowed" facility
      };

      if (vibeQuery) {
        body.aiSearch = `${vibeQuery} pet friendly`;
      } else if (placeId) {
        body.placeId = placeId;
      }

      const ratesRes = await fetch("/api/rates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const ratesData = await ratesRes.json();

      if (!ratesData.data || ratesData.data.length === 0) {
        setError("No pet-friendly hotels found for your search. Try adjusting your dates or destination.");
        setLoading(false);
        return;
      }

      const rateItems: HotelRateData[] = ratesData.data;
      const briefHotels: HotelBrief[] = ratesData.hotels || [];

      // Build a price map from rates data
      const priceMap = new Map<
        string,
        { price: number; currency: string; refundable: boolean }
      >();
      for (const item of rateItems) {
        const firstRate = item.roomTypes?.[0]?.rates?.[0];
        if (firstRate) {
          priceMap.set(item.hotelId, {
            price: firstRate.retailRate.total[0].amount,
            currency: firstRate.retailRate.total[0].currency,
            refundable: firstRate.cancellationPolicies?.refundableTag === "RFN",
          });
        }
      }

      // Get unique hotel IDs
      const hotelIds = rateItems.map((h) => h.hotelId);

      // Fetch hotel details to get pet policy info
      setFilteringMsg(`Fetching pet policies for ${hotelIds.length} hotels...`);

      const detailPromises = hotelIds.map((id) =>
        fetch(`/api/hotel?hotelId=${encodeURIComponent(id)}`)
          .then((r) => r.json())
          .then((d) => d.data as HotelDetail | undefined)
          .catch(() => undefined)
      );

      const details = await Promise.all(detailPromises);

      // Build hotel cards — verify pet-friendliness with detail data
      const petFriendlyCards: HotelCard[] = [];

      for (let i = 0; i < hotelIds.length; i++) {
        const hotelId = hotelIds[i];
        const detail = details[i];
        const priceInfo = priceMap.get(hotelId);
        const brief = briefHotels.find((b) => b.id === hotelId);

        // Extract pet policy from multiple sources in priority order:
        // 1. policies[].pets_allowed field (richest info)
        // 2. policies[].name containing "pet" → description
        // 3. petsAllowed boolean
        let petPolicy: string | undefined;
        let isPetFriendly = false;

        if (detail) {
          // Check policies array for pets_allowed field
          if (detail.policies) {
            for (const pol of detail.policies) {
              // Check the dedicated pets_allowed field first
              if (pol.pets_allowed && pol.pets_allowed.trim()) {
                const petsText = pol.pets_allowed.toLowerCase();
                if (
                  !petsText.includes("no pets allowed") &&
                  !petsText.includes("pets are not allowed") &&
                  !petsText.includes("pets not permitted") &&
                  !petsText.includes("no pets are allowed")
                ) {
                  petPolicy = pol.pets_allowed;
                  isPetFriendly = true;
                  break;
                }
              }
              // Fallback: check policy name/description for pet info
              if (pol.name.toLowerCase().includes("pet")) {
                const desc = pol.description.toLowerCase();
                if (
                  !desc.includes("no pets allowed") &&
                  !desc.includes("pets are not allowed") &&
                  !desc.includes("pets not permitted") &&
                  !desc.includes("no pets are allowed")
                ) {
                  petPolicy = pol.description;
                  isPetFriendly = true;
                }
              }
            }
          }

          // Check top-level petsAllowed boolean
          if (!isPetFriendly && detail.petsAllowed === true) {
            isPetFriendly = true;
            petPolicy = "Pets are welcome at this hotel.";
          }

          // Check if facilities list mentions pets
          if (!isPetFriendly && detail.hotelFacilities) {
            const hasPetFacility = detail.hotelFacilities.some((f) =>
              f.toLowerCase().includes("pet")
            );
            if (hasPetFacility) {
              isPetFriendly = true;
              petPolicy = petPolicy || "This hotel offers pet-friendly facilities.";
            }
          }

          // If petsAllowed is explicitly false, exclude even if facility filter passed
          if (detail.petsAllowed === false) {
            isPetFriendly = false;
            petPolicy = undefined;
          }
        } else {
          // No detail data available — trust the facility filter from the API
          isPetFriendly = true;
        }

        if (isPetFriendly) {
          petFriendlyCards.push({
            hotelId,
            name: detail?.name || brief?.name || `Hotel ${hotelId}`,
            photo:
              detail?.main_photo ||
              detail?.hotelImages?.[0]?.url ||
              brief?.main_photo ||
              "",
            address:
              detail
                ? `${detail.address}, ${detail.city}`
                : brief?.address || "",
            rating: brief?.rating || detail?.starRating || 0,
            price: priceInfo?.price || 0,
            currency: priceInfo?.currency || "USD",
            tags: brief?.tags,
            story: brief?.story,
            petPolicy: petPolicy || "Contact hotel for pet policy details",
            refundable: priceInfo?.refundable ?? false,
          });
        }
      }

      if (petFriendlyCards.length === 0) {
        setError(
          "No pet-friendly hotels found for your search. Try a different destination or use the vibe search with pet-related terms."
        );
      }

      setHotels(petFriendlyCards);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setFilteringMsg("");
    }
  }, [checkin, checkout, adults, placeId, vibeQuery]);

  useEffect(() => {
    if (checkin && checkout) {
      fetchResults();
    }
  }, [fetchResults, checkin, checkout]);

  function navigateToHotel(hotelId: string) {
    const params = new URLSearchParams({
      hotelId,
      checkin,
      checkout,
      adults: String(adults),
      petType,
      petCount,
    });
    router.push(`/hotel?${params.toString()}`);
  }

  const searchLabel = vibeQuery
    ? `"${vibeQuery}"`
    : placeName || "your destination";

  // Dynamic SEO title for browser tab
  useEffect(() => {
    const destination = placeName || vibeQuery || "Your Destination";
    document.title = `Pet-Friendly Hotels in ${destination} | PetOtel`;
  }, [placeName, vibeQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14">
      {/* Search Summary */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-text-secondary hover:text-accent transition-colors mb-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to search
        </button>
        <h1 className="text-2xl font-bold text-foreground">
          Pet-friendly hotels in {searchLabel}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {checkin} to {checkout} · {adults} {adults === 1 ? "adult" : "adults"}{" "}
          · {petCount} {petType}
          {Number(petCount) > 1 ? "s" : ""}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div>
          {filteringMsg && (
            <div className="flex items-center gap-3 mb-6 bg-accent-bg border border-accent-light rounded-xl px-4 py-3">
              <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              <p className="text-sm text-accent">{filteringMsg}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-20">
          <PawPrint className="w-12 h-12 text-warm-gray mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            No pet-friendly hotels found
          </p>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Try a new search
          </button>
        </div>
      )}

      {/* Results Grid */}
      {!loading && !error && (
        <>
          <p className="text-sm text-text-secondary mb-6">
            {hotels.length} pet-friendly{" "}
            {hotels.length === 1 ? "hotel" : "hotels"} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <button
                key={hotel.hotelId}
                onClick={() => navigateToHotel(hotel.hotelId)}
                className="bg-surface rounded-2xl border border-border-custom overflow-hidden text-left hover:shadow-lg hover:border-accent/30 transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-surface-alt overflow-hidden">
                  {hotel.photo ? (
                    <Image
                      src={hotel.photo}
                      alt={hotel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-gray">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                  {/* Pet Badge */}
                  <div className="absolute top-3 left-3 bg-sage text-white text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                    <PawPrint className="w-3 h-3" />
                    Pet Friendly
                  </div>
                  {/* Refundable Badge */}
                  {hotel.refundable && (
                    <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm text-sage text-xs font-medium px-2 py-1 rounded-full">
                      Free cancellation
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 group-hover:text-accent transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3">
                    {hotel.address}
                  </p>

                  {/* Rating */}
                  {hotel.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-md">
                        {hotel.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {hotel.rating >= 9
                          ? "Exceptional"
                          : hotel.rating >= 8
                            ? "Excellent"
                            : hotel.rating >= 7
                              ? "Very Good"
                              : "Good"}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {hotel.tags && hotel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {hotel.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-text-secondary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pet Policy Preview */}
                  {hotel.petPolicy && (
                    <p className="text-xs text-sage bg-sage-light px-3 py-2 rounded-lg mb-3 line-clamp-2 flex items-start gap-1.5">
                      <PawPrint className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{hotel.petPolicy}</span>
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-text-secondary">from</span>
                      <p className="text-xl font-bold text-foreground">
                        ${hotel.price.toFixed(0)}
                        <span className="text-xs font-normal text-text-secondary ml-1">
                          {hotel.currency}
                        </span>
                      </p>
                    </div>
                    <span className="text-sm text-accent font-medium group-hover:underline inline-flex items-center gap-1">
                      View rooms
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
