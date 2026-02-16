"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import LoadingSpinner from "@/components/LoadingSpinner";
import { PrebookData } from "@/lib/types";
import {
  PawPrint,
  ArrowLeft,
} from "lucide-react";

// Note: This page should not be indexed by search engines.
// The noindex meta tag is added via the metadata export below.

type Step = "prebook" | "details" | "payment";

function CheckoutFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const offerId = searchParams.get("offerId") || "";
  const hotelId = searchParams.get("hotelId") || "";
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const adults = searchParams.get("adults") || "2";
  const petType = searchParams.get("petType") || "dog";
  const petCount = searchParams.get("petCount") || "1";
  const hotelName = searchParams.get("hotelName") || "";
  const roomName = searchParams.get("roomName") || "";

  const [step, setStep] = useState<Step>("prebook");
  const [prebookData, setPrebookData] = useState<PrebookData | null>(null);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const paymentInitialized = useRef(false);

  // Step 1: Prebook
  const doPrebook = useCallback(async () => {
    if (!offerId) return;
    setStep("prebook");
    setError("");

    try {
      const res = await fetch("/api/prebook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const data = await res.json();

      if (data.error) {
        setError(
          data.error.description ||
          "This rate is no longer available. Please go back and select a different room."
        );
        return;
      }

      if (data.data) {
        setPrebookData(data.data);
        setStep("details");
      } else {
        setError("Failed to prebook. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  }, [offerId]);

  useEffect(() => {
    doPrebook();
  }, [doPrebook]);

  // Step 3: Initialize payment SDK
  useEffect(() => {
    if (
      step !== "payment" ||
      !prebookData ||
      !sdkLoaded ||
      paymentInitialized.current
    )
      return;

    paymentInitialized.current = true;

    // Store sensitive data in sessionStorage before redirecting
    // This prevents exposing transactionId and prebookId in URLs
    sessionStorage.setItem(
      "checkout_data",
      JSON.stringify({
        prebookId: prebookData.prebookId,
        transactionId: prebookData.transactionId,
        hotelId,
        checkin,
        checkout,
        firstName,
        lastName,
        email,
        hotelName,
        petType,
        petCount,
      })
    );

    const returnUrl = `${window.location.origin}/confirmation`;

    try {
      const config = {
        publicKey: process.env.NEXT_PUBLIC_LITEAPI_PUBLIC_KEY || "sandbox",
        secretKey: prebookData.secretKey,
        returnUrl,
        targetElement: "#payment-element",
        appearance: { theme: "flat" },
        options: { business: { name: "PetOtel" } },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payment = new (window as any).LiteAPIPayment(config);
      payment.handlePayment();
      setPaymentReady(true);
    } catch (err) {
      console.error("Payment SDK init error:", err);
      setError("Failed to initialize payment. Please try again.");
    }
  }, [
    step,
    prebookData,
    sdkLoaded,
    hotelId,
    checkin,
    checkout,
    firstName,
    lastName,
    email,
    hotelName,
    petType,
    petCount,
  ]);

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;
    paymentInitialized.current = false;
    setStep("payment");
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PawPrint className="w-12 h-12 text-warm-gray mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          Booking Error
        </p>
        <p className="text-sm text-text-secondary mb-6">{error}</p>
        <button
          onClick={() =>
            router.push(
              `/hotel?hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&petType=${petType}&petCount=${petCount}`
            )
          }
          className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to hotel
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1"
        onLoad={() => setSdkLoaded(true)}
        strategy="afterInteractive"
      />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-14">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["prebook", "details", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s
                  ? "bg-accent text-white"
                  : i <
                    ["prebook", "details", "payment"].indexOf(step)
                    ? "bg-sage text-white"
                    : "bg-surface-alt text-text-secondary"
                  }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${step === s
                  ? "text-foreground font-medium"
                  : "text-text-secondary"
                  }`}
              >
                {s === "prebook"
                  ? "Checking"
                  : s === "details"
                    ? "Guest Info"
                    : "Payment"}
              </span>
              {i < 2 && (
                <div className="w-8 h-px bg-border-custom mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Booking Summary */}
        <div className="bg-surface rounded-2xl border border-border-custom p-5 mb-6">
          <h2 className="font-semibold text-foreground mb-3">
            Booking Summary
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Hotel</span>
              <span className="font-medium text-foreground">{hotelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Room</span>
              <span className="text-foreground">{roomName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Dates</span>
              <span className="text-foreground">
                {checkin} → {checkout}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Guests</span>
              <span className="text-foreground">
                {adults} {Number(adults) === 1 ? "adult" : "adults"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Pets</span>
              <span className="text-foreground">
                {petCount} {petType}
                {Number(petCount) > 1 ? "s" : ""}
              </span>
            </div>
            {prebookData && (
              <>
                <div className="border-t border-border-custom pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-accent">
                      ${prebookData.price.toFixed(2)}{" "}
                      <span className="text-xs font-normal text-text-secondary">
                        {prebookData.currency}
                      </span>
                    </span>
                  </div>
                </div>
                {prebookData.roomTypes?.[0]?.rates?.[0]?.cancellationPolicies
                  ?.refundableTag === "RFN" && (
                    <p className="text-xs text-sage bg-sage-light px-3 py-1.5 rounded-lg">
                      Free cancellation available
                    </p>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Step 1: Prebook loading */}
        {step === "prebook" && (
          <LoadingSpinner message="Checking availability and pricing... This may take a few seconds." />
        )}

        {/* Step 2: Guest Details Form */}
        {step === "details" && (
          <div className="bg-surface rounded-2xl border border-border-custom p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Guest Details
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Enter the primary guest information for this booking.
            </p>
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border-custom rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="john@example.com"
                />
              </div>

              {/* Pet Info Summary */}
              <div className="bg-sage-light rounded-xl p-4 mt-4">
                <h3 className="text-sm font-medium text-sage-dark mb-1 flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />
                  Traveling with pets
                </h3>
                <p className="text-sm text-sage-dark/80">
                  {petCount} {petType}
                  {Number(petCount) > 1 ? "s" : ""} — Please ensure your
                  pet(s) meet the hotel&apos;s pet policy requirements.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm mt-4"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === "payment" && (
          <div className="bg-surface rounded-2xl border border-border-custom p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Payment
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Complete your payment to confirm the booking.
            </p>

            {/* Payment Element */}
            <div id="payment-element" className="min-h-[200px]">
              {!paymentReady && (
                <LoadingSpinner message="Loading payment form..." />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading checkout..." />}>
      <CheckoutFlow />
    </Suspense>
  );
}
