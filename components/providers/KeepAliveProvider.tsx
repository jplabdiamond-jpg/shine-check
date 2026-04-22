"use client";

import { useEffect } from "react";

// Renderの無料プランは15分無通信でスリープするため14分ごとにpingする
const INTERVAL_MS = 14 * 60 * 1000;

export default function KeepAliveProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const ping = () => {
      fetch("/api/health", { method: "GET", cache: "no-store" }).catch(() => {});
    };

    // 即時1回 + 以降14分ごと
    ping();
    const id = setInterval(ping, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return <>{children}</>;
}
