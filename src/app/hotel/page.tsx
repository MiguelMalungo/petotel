"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import LoadingSpinner from "@/components/LoadingSpinner";
import { HotelDetail, HotelRateData } from "@/lib/types";
import {
  PawPrint,
  ArrowLeft,
  Building2,
  BedDouble,
  Star,
  Info,
} from "lucide-react";

interface GroupedRoom {
  mappedRoomId: number;
  roomName: string;
  roomPhoto: string;
  offers: {
    offerId: string;
    rateName: string;
    boardName: string;
    price: number;
    currency: string;
    taxesIncluded: boolean;
    taxAmount?: number;
    refundableTag: string;
    cancelTime?: string;
  }[];
}

function HotelDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const hotelId = searchParams.get("hotelId") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = Number(searchParams.get("adults") || 2);
  const petType = searchParams.get("petType") || "dog";
  const petCount = searchParams.get("petCount") || "1";

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [rooms, setRooms] = useState<GroupedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchHotelData = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    setError("");

    try {
      // Fetch hotel details and rates in parallel
      const [detailRes, ratesRes] = await Promise.all([
        fetch(`/api/hotel?hotelId=${encodeURIComponent(hotelId)}`),
        fetch("/api/rates", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            hotelIds: [hotelId],
            occupancies: [{ adults }],
            currency: "USD",
            guestNationality: "US",
            checkin,
            checkout,
            roomMapping: true,
            includeHotelData: true,
          }),
        }),
      ]);

      const detailData = await detailRes.json();
      const ratesData = await ratesRes.json();

      if (detailData.data) {
        setHotel(detailData.data);
      } else {
        setError("Hotel not found.");
      }
      setLoading(false);

      // Process rates
      if (ratesData.data && ratesData.data.length > 0) {
        const hotelRates: HotelRateData = ratesData.data[0];
        const hotelRooms = detailData.data?.rooms || [];

        // Group by mappedRoomId
        const groupMap = new Map<number, GroupedRoom>();

        for (const roomType of hotelRates.roomTypes) {
          for (const rate of roomType.rates) {
            const rid = rate.mappedRoomId;
            if (!groupMap.has(rid)) {
              const matchingRoom = hotelRooms.find(
                (r: { id: number; roomName: string; photos: { url: string }[] }) => r.id === rid
              );
              groupMap.set(rid, {
                mappedRoomId: rid,
                roomName: matchingRoom?.roomName || rate.name,
                roomPhoto: matchingRoom?.photos?.[0]?.url || "",
                offers: [],
              });
            }

            groupMap.get(rid)!.offers.push({
              offerId: roomType.offerId,
              rateName: rate.name,
              boardName: rate.boardName,
              price: rate.retailRate.total[0].amount,
              currency: rate.retailRate.total[0].currency,
              taxesIncluded:
                rate.retailRate.taxesAndFees?.[0]?.included ?? false,
              taxAmount: rate.retailRate.taxesAndFees?.[0]?.amount,
              refundableTag:
                rate.cancellationPolicies?.refundableTag || "NRFN",
              cancelTime:
                rate.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime,
            });
          }
        }

        setRooms(Array.from(groupMap.values()));
      }
      setRatesLoading(false);
    } catch {
      setError("Failed to load hotel details. Please try again.");
      setLoading(false);
      setRatesLoading(false);
    }
  }, [hotelId, checkin, checkout, adults]);

  useEffect(() => {
    fetchHotelData();
  }, [fetchHotelData]);

  // Dynamic SEO title for browser tab
  useEffect(() => {
    if (hotel) {
      document.title = `${hotel.name} — Pet-Friendly Hotel in ${hotel.city} | PetOtel`;
    }
  }, [hotel]);

  function handleSelectOffer(offerId: string, price: number, currency: string, roomName: string) {
    const params = new URLSearchParams({
      offerId,
      hotelId,
      checkin,
      checkout,
      adults: String(adults),
      petType,
      petCount,
      price: String(price),
      currency,
      roomName,
      hotelName: hotel?.name || "",
    });
    router.push(`/checkout?${params.toString()}`);
  }

  if (loading) {
    return <LoadingSpinner message="Loading hotel details..." />;
  }

  if (error || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <PawPrint className="w-12 h-12 text-warm-gray mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          {error || "Hotel not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Go back
        </button>
      </div>
    );
  }

  // Extract pet policy from multiple sources
  let petPolicyText: string | undefined;
  let petPolicySource: "policy" | "boolean" | "facility" | undefined;

  if (hotel.policies) {
    for (const pol of hotel.policies) {
      // Check dedicated pets_allowed field first (richest info)
      if (pol.pets_allowed && pol.pets_allowed.trim()) {
        petPolicyText = pol.pets_allowed;
        petPolicySource = "policy";
        break;
      }
      // Fallback: check policy name for "pet"
      if (pol.name.toLowerCase().includes("pet") && pol.description.trim()) {
        petPolicyText = pol.description;
        petPolicySource = "policy";
      }
    }
  }

  // Fallback to petsAllowed boolean
  if (!petPolicyText && hotel.petsAllowed === true) {
    petPolicyText = "Pets are welcome at this hotel. Contact the property for specific requirements and fees.";
    petPolicySource = "boolean";
  }

  // Check facilities for pet-related entries
  if (!petPolicyText && hotel.hotelFacilities) {
    const petFacilities = hotel.hotelFacilities.filter((f) =>
      f.toLowerCase().includes("pet")
    );
    if (petFacilities.length > 0) {
      petPolicyText = `This hotel offers: ${petFacilities.join(", ")}. Contact the property for full pet policy details.`;
      petPolicySource = "facility";
    }
  }

  const isPetFriendly = hotel.petsAllowed !== false && (!!petPolicyText || hotel.petsAllowed === true);

  // Legacy reference for the JSX below
  const petPolicy = petPolicyText
    ? { name: "Pet Policy", description: petPolicyText }
    : undefined;

  const images = hotel.hotelImages?.length
    ? hotel.hotelImages
    : hotel.main_photo
      ? [{ url: hotel.main_photo }]
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-text-secondary hover:text-accent transition-colors mb-6 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to results
      </button>

      {/* Hotel Header */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
        {/* Images */}
        <div className="lg:col-span-3">
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-surface-alt">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage]?.url || images[0]?.url}
                alt={hotel.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warm-gray">
                <Building2 className="w-16 h-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.slice(0, 8).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === i
                    ? "border-accent"
                    : "border-transparent hover:border-accent/30"
                    }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hotel Info */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-2xl border border-border-custom p-6">
            <div className="flex items-center gap-1 mb-1">
              {hotel.starRating > 0 &&
                Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {hotel.name}
            </h1>
            <p className="text-sm text-text-secondary mb-4">
              {hotel.address}, {hotel.city}, {hotel.country}
            </p>

            <div className="text-sm text-text-secondary mb-4">
              {checkin} → {checkout} · {adults}{" "}
              {adults === 1 ? "adult" : "adults"} · {petCount} {petType}
              {Number(petCount) > 1 ? "s" : ""}
            </div>

            {/* Pet Policy */}
            {isPetFriendly && petPolicy ? (
              <div className="bg-sage-light border border-sage/20 rounded-xl p-4 mb-4">
                <h3 className="font-semibold text-sage-dark text-sm mb-2 flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  Pet Policy
                </h3>
                <p className="text-sm text-sage-dark/80 leading-relaxed">
                  {petPolicy.description}
                </p>
                {petPolicySource === "boolean" || petPolicySource === "facility" ? (
                  <p className="text-xs text-sage-dark/60 mt-2">
                    We recommend confirming specific pet requirements directly with the hotel before check-in.
                  </p>
                ) : null}
              </div>
            ) : hotel.petsAllowed === false ? (
              <div className="bg-error-light border border-error/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-error flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  This hotel does not allow pets.
                </p>
              </div>
            ) : (
              <div className="bg-accent-bg border border-accent-light rounded-xl p-4 mb-4">
                <p className="text-sm text-accent flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  Contact the hotel directly for pet policy details.
                </p>
              </div>
            )}

            {/* Facilities */}
            {hotel.hotelFacilities && hotel.hotelFacilities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Facilities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.hotelFacilities.slice(0, 8).map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full bg-surface-alt text-text-secondary"
                    >
                      {f}
                    </span>
                  ))}
                  {hotel.hotelFacilities.length > 8 && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-surface-alt text-text-secondary">
                      +{hotel.hotelFacilities.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sentiment */}
            {hotel.sentiment_analysis && (
              <div className="space-y-2">
                {hotel.sentiment_analysis.pros?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-sage mb-1">
                      Guests love
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {hotel.sentiment_analysis.pros.slice(0, 4).map((p) => (
                        <span
                          key={p}
                          className="text-xs px-2 py-0.5 rounded-full bg-sage-light text-sage"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {hotel.hotelDescription && (
        <div className="bg-surface rounded-2xl border border-border-custom p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            About this hotel
          </h2>
          <div
            className="text-sm text-text-secondary leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: hotel.hotelDescription }}
          />
        </div>
      )}

      {/* Room Rates */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Available Rooms
        </h2>
        {ratesLoading ? (
          <LoadingSpinner message="Loading available rooms..." />
        ) : rooms.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border-custom p-8 text-center">
            <p className="text-text-secondary">
              No rooms available for the selected dates. Try different dates.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div
                key={room.mappedRoomId}
                className="bg-surface rounded-2xl border border-border-custom overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Room Image */}
                  <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0 bg-surface-alt">
                    {room.roomPhoto ? (
                      <Image
                        src={room.roomPhoto}
                        alt={room.roomName}
                        fill
                        className="object-cover"
                        sizes="224px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warm-gray min-h-[160px]">
                        <BedDouble className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {room.roomName}
                    </h3>

                    {/* Offers */}
                    <div className="space-y-3">
                      {room.offers.map((offer) => (
                        <div
                          key={offer.offerId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface-alt/50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {offer.rateName}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border-custom">
                                {offer.boardName}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.refundableTag === "RFN"
                                  ? "bg-sage-light text-sage"
                                  : "bg-terracotta-light text-terracotta"
                                  }`}
                              >
                                {offer.refundableTag === "RFN"
                                  ? "Free cancellation"
                                  : "Non-refundable"}
                              </span>
                              {offer.taxesIncluded && (
                                <span className="text-xs text-text-secondary">
                                  Taxes included
                                </span>
                              )}
                            </div>
                            {offer.cancelTime &&
                              offer.refundableTag === "RFN" && (
                                <p className="text-xs text-text-secondary mt-1">
                                  Free cancellation before{" "}
                                  {new Date(offer.cancelTime).toLocaleDateString()}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">
                                ${offer.price.toFixed(0)}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {offer.currency} total
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleSelectOffer(
                                  offer.offerId,
                                  offer.price,
                                  offer.currency,
                                  room.roomName
                                )
                              }
                              className="px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors whitespace-nowrap"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Info */}
      {hotel.hotelImportantInformation && (
        <div className="bg-accent-bg border border-accent-light rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Important Information
          </h3>
          <div
            className="text-sm text-text-secondary prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: hotel.hotelImportantInformation,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function HotelPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading hotel..." />}>
      <HotelDetailPage />
    </Suspense>
  );
}
