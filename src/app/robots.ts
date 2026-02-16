import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/confirmation"],
      },
    ],
    sitemap: "https://petotel.com/sitemap.xml",
  };
}
