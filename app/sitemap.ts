import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://saifulsir.com";

  const [posts, cats] = await Promise.all([
    db.post
      .findMany({ select: { id: true, slug: true, createdAt: true } })
      .catch(() => []),
    db.category.findMany({ select: { slug: true } }).catch(() => []),
  ]);

  const fixed = [
    "",
    "/academic",
    "/admission",
    "/ntrca",
    "/jobs",
    "/quiz",
    "/library",
    "/videos",
    "/tests",
    "/blog",
    "/hire",
    "/privacy",
    "/terms",
    "/tools",
    "/tools/gpa",
    "/tools/nu-cgpa",
    "/tools/cover-page",
    "/tools/photo-resizer",
  ];

  return [
    ...fixed.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...cats.map((c) => ({
      url: `${base}/category/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug ?? p.id}`,
      lastModified: p.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
