import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NextAuthProvider from "@/components/providers/SessionProvider";
import KeepAliveProvider from "@/components/providers/KeepAliveProvider";

export const metadata: Metadata = {
  title: "Shine Check - 夜職勘定サポート",
  description: "キャバクラ・スナック・ホスト向け伝票デジタル化SaaS",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Shine Check" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  metadataBase: new URL("https://check.yoru-navi-shine.com"),
  alternates: {
    canonical: "https://check.yoru-navi-shine.com/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Shine Check",
    title: "Shine Check | キャバクラ・ガールズバー専用 クラウド伝票管理",
    description: "水商売の現場に特化したクラウド伝票管理ツール。手書きミスをゼロに、売上管理を自動化。無料で今すぐ始められます。",
    url: "https://check.yoru-navi-shine.com/",
    images: [
      {
        url: "https://check.yoru-navi-shine.com/ogp.png",
        width: 1200,
        height: 630,
        alt: "Shine Check - 水商売専用クラウド伝票管理ツール",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shine Check | キャバクラ・ガールズバー専用 クラウド伝票管理",
    description: "水商売の現場に特化したクラウド伝票管理ツール。手書きミスをゼロに、売上管理を自動化。無料で今すぐ始められます。",
    images: ["https://check.yoru-navi-shine.com/ogp.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF2D78",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <NextAuthProvider>
        <KeepAliveProvider>
        {children}
        </KeepAliveProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "14px", maxWidth: "380px" },
          }}
        />
        </NextAuthProvider>
      </body>
    </html>
  );
}
