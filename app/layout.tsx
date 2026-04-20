import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NextAuthProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Shine Check - 夜職勘定サポート",
  description: "キャバクラ・スナック・ホスト向け伝票デジタル化SaaS",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Shine Check" },
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
        {children}
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
