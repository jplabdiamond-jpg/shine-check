import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://check.yoru-navi-shine.com/",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://check.yoru-navi-shine.com/lp",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://check.yoru-navi-shine.com/register",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: "https://check.yoru-navi-shine.com/login",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://check.yoru-navi-shine.com/privacy",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://check.yoru-navi-shine.com/terms",
      lastModified: new Date("2026-04-22"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
