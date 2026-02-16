import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet-Friendly Hotel Details — Rooms, Policies & Pricing",
  description:
    "View detailed pet policies, room options, facilities, and pricing for this pet-friendly hotel. Book your stay knowing your furry companion is welcome.",
  openGraph: {
    title: "Pet-Friendly Hotel Details | PetOtel",
    description:
      "See pet policies, room rates, facilities, and guest reviews for this pet-friendly hotel. Book with confidence on PetOtel.",
  },
};

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
