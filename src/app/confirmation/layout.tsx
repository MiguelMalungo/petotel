import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
