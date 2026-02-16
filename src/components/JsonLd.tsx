export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PetOtel",
    url: "https://petotel.com",
    logo: "https://petotel.com/media/og-image.png",
    description:
      "Find and book verified pet-friendly hotels worldwide. Travel with your furry companions without worry.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "English",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PetOtel",
    url: "https://petotel.com",
    description:
      "Book pet-friendly hotels worldwide. Every listing is verified to welcome dogs, cats, and other pets.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://petotel.com/search?vibeQuery={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const travelAgencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "PetOtel",
    url: "https://petotel.com",
    description:
      "Pet-friendly hotel booking platform. Find verified accommodations that welcome dogs, cats, and other pets worldwide.",
    priceRange: "$$",
    areaServed: {
      "@type": "Place",
      name: "Worldwide",
    },
    serviceType: "Pet-Friendly Hotel Booking",
    slogan: "Travel with your best friend",
    knowsAbout: [
      "Pet-friendly hotels",
      "Dog-friendly accommodation",
      "Cat-friendly lodging",
      "Pet travel",
      "Pet-friendly vacation",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does PetOtel verify that hotels are pet-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every hotel listing on PetOtel is checked for pet policies. We verify that each property welcomes pets and display their specific pet rules, fees, and size limits so there are no surprises at check-in.",
        },
      },
      {
        "@type": "Question",
        name: "What types of pets are allowed at PetOtel hotels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most PetOtel hotels welcome dogs and cats. Some properties also accept other pets. Each hotel listing clearly shows which types of pets are welcome, along with any size restrictions or additional fees.",
        },
      },
      {
        "@type": "Question",
        name: "Are there extra fees for bringing pets to hotels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pet fees vary by hotel. PetOtel displays each hotel's pet policy upfront, including any additional charges, deposit requirements, or weight limits, so you know the full cost before booking.",
        },
      },
      {
        "@type": "Question",
        name: "Can I search for pet-friendly hotels by describing what I want?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! PetOtel offers an AI-powered Vibe Search feature. You can describe your ideal stay — like 'beachfront resort with dog park' or 'cozy mountain cabin that welcomes big dogs' — and we'll find matching pet-friendly hotels.",
        },
      },
      {
        "@type": "Question",
        name: "Is PetOtel free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, PetOtel is completely free to search and browse. You only pay when you book a hotel, and the price you see is the price you pay — no hidden booking fees.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(travelAgencySchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}
