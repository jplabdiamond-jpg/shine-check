export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tables/:path*",
    "/slips/:path*",
    "/products/:path*",
    "/casts/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/upgrade/:path*",
  ],
};
