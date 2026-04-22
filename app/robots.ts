import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/lp", "/register", "/login", "/privacy", "/terms"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/slips/",
          "/tables/",
          "/products/",
          "/settings/",
          "/admin/",
        ],
      },
    ],
    sitemap: "https://check.yoru-navi-shine.com/sitemap.xml",
  };
}
