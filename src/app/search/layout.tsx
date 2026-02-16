import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Pet-Friendly Hotels — Find the Perfect Stay for You & Your Pet",
  description:
    "Browse verified pet-friendly hotels by destination or vibe. Filter by pet type, dates, and number of guests to find the perfect accommodation that welcomes your furry friend.",
  openGraph: {
    title: "Search Pet-Friendly Hotels | PetOtel",
    description:
      "Find verified pet-friendly hotels worldwide. Every listing welcomes dogs, cats, and other pets with clear policies.",
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
