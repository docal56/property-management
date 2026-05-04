import type { MetadataRoute } from "next";

const baseUrl = "https://usebuzz.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/calls/",
        "/components/",
        "/issues/",
        "/settings/",
        "/sign-in/",
        "/sign-up/",
        "/sign-out/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
