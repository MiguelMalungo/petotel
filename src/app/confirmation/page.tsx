"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookingData } from "@/lib/types";
import {
  PawPrint,
  PartyPopper,
  CheckCircle2,
  Building2,
} from "lucide-react";

function ConfirmationContent() {
  const router = useRouter();
  const bookingAttempted = useRef(false);

  // Retrieve sensitive data from sessionStorage instead of URL params
  const [sessionData, setSessionData] = useState<{
    prebookId: string;
    transactionId: string;
    hotelId: string;
    checkin: string;
    checkout: string;
    firstName: string;
    lastName: string;
    email: string;
    hotelName: string;
    petType: string;
    petCount: string;
  } | null>(null);

  const prebookId = sessionData?.prebookId || "";
  const transactionId = sessionData?.transactionId || "";
  const hotelId = sessionData?.hotelId || "";
  const checkin = sessionData?.checkin || "";
  const checkout = sessionData?.checkout || "";
  const firstName = sessionData?.firstName || "";
  const lastName = sessionData?.lastName || "";
  const email = sessionData?.email || "";
  const hotelName = sessionData?.hotelName || "";
  const petType = sessionData?.petType || "dog";
  const petCount = sessionData?.petCount || "1";

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load checkout data from sessionStorage on mount
  useEffect(() => {
    const data = sessionStorage.getItem("checkout_data");
    if (data) {
      try {
        setSessionData(JSON.parse(data));
      } catch (err) {
        console.error("Failed to parse checkout_data from sessionStorage:", err);
        setError("Invalid session data. Please try booking again.");
        setLoading(false);
      }
    } else {
      setError("Session expired. Please start a new booking.");
      setLoading(false);
    }
  }, []);

  const completeBooking = useCallback(async () => {
    if (!prebookId || !transactionId || bookingAttempted.current) return;
    bookingAttempted.current = true;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prebookId,
          holder: { firstName, lastName, email },
          payment: {
            method: "TRANSACTION_ID",
            transactionId,
          },
          guests: [
            {
              occupancyNumber: 1,
              firstName,
              lastName,
              email,
            },
          ],
        }),
      });
      const data = await res.json();

      if (data.error) {
        setError(
          data.error.description || "Booking failed. Please contact support."
        );
      } else if (data.data) {
        setBooking(data.data);
        // Clear sensitive data from sessionStorage after successful booking
        sessionStorage.removeItem("checkout_data");
      } else {
        setError("Unexpected response. Please contact support.");
      }
    } catch {
      setError("Network error. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  }, [prebookId, transactionId, firstName, lastName, email]);

  useEffect(() => {
    completeBooking();
  }, [completeBooking]);

  if (loading) {
    return (
      <LoadingSpinner message="Confirming your booking... This may take a few seconds." />
    );
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
          onClick={() => router.push("/")}
          className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Start a new search
        </button>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-14">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-sage-light rounded-full flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-10 h-10 text-sage" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-text-secondary">
          Your pet-friendly stay is all set. Time to pack those treats!
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-surface rounded-2xl border border-border-custom overflow-hidden mb-6">
        <div className="bg-sage px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 uppercase tracking-wider">
                Booking ID
              </p>
              <p className="text-lg font-bold text-white">
                {booking.bookingId}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${booking.status === "CONFIRMED"
                ? "bg-white text-sage"
                : "bg-accent-light text-accent"
                }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Hotel
              </p>
              <p className="font-semibold text-foreground">
                {booking.hotel?.name || hotelName}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Confirmation Code
              </p>
              <p className="font-mono font-semibold text-foreground">
                {booking.hotelConfirmationCode}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Check-in
              </p>
              <p className="font-medium text-foreground">
                {booking.checkin || checkin}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Check-out
              </p>
              <p className="font-medium text-foreground">
                {booking.checkout || checkout}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Guest
              </p>
              <p className="font-medium text-foreground">
                {firstName} {lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="text-xl font-bold text-accent">
                ${booking.price?.toFixed(2)}{" "}
                <span className="text-xs font-normal text-text-secondary">
                  {booking.currency}
                </span>
              </p>
            </div>
          </div>

          {booking.cancellationPolicies?.refundableTag === "RFN" && (
            <div className="bg-sage-light rounded-xl px-4 py-3">
              <p className="text-sm text-sage font-medium">
                Free cancellation available
              </p>
              {booking.cancellationPolicies.cancelPolicyInfos?.[0]
                ?.cancelTime && (
                  <p className="text-xs text-sage-dark/70 mt-0.5">
                    Cancel before{" "}
                    {new Date(
                      booking.cancellationPolicies.cancelPolicyInfos[0].cancelTime
                    ).toLocaleDateString()}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Pet Reminder */}
      <div className="bg-accent-bg border border-accent-light rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
          <PawPrint className="w-4 h-4" />
          Pet Travel Checklist
        </h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            Check the hotel&apos;s pet policy for any specific requirements
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            Pack food, water bowl, leash, and favorite toys
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            Bring vaccination records and any required documentation
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            Inform the hotel about your {petCount} {petType}
            {Number(petCount) > 1 ? "s" : ""} at check-in
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm"
        >
          Book another stay
        </button>
        <button
          onClick={() => {
            router.push(
              `/hotel?hotelId=${hotelId || booking.hotel?.hotelId}&checkin=${checkin}&checkout=${checkout}&adults=2&petType=${petType}&petCount=${petCount}`
            );
          }}
          className="flex-1 py-3 bg-surface border border-border-custom text-foreground font-semibold rounded-xl hover:bg-surface-alt transition-colors text-sm inline-flex items-center justify-center gap-1.5"
        >
          <Building2 className="w-4 h-4" />
          View hotel details
        </button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <LoadingSpinner message="Loading booking confirmation..." />
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
