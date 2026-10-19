import type { MetadataRoute } from "next";

const base = (process.env.SITE_URL ?? "https://saifulsir.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/login", "/teacher/"import type { MetadataRoute } from "next";

const base = (process.env.SITE_URL ?? "https://saifulsir.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/login", "/teacher/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
                   }],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
