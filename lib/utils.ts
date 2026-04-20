import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  // NeonのNUMERIC型は文字列で返るため必ずNumber()変換
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(Number(amount ?? 0));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getElapsedMinutes(startAt: string): number {
  const start = new Date(startAt).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 60000);
}

export function formatElapsed(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
}

export function getTodayBusinessDate(): string {
  // JST (UTC+9) でAM3:00基準の営業日を返す
  // 0:00〜2:59 は前日の営業日扱い（夜間営業対応）
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hour = jst.getUTCHours(); // JST時刻のhour
  if (hour < 3) {
    // 前日扱い
    jst.setUTCDate(jst.getUTCDate() - 1);
  }
  return jst.toISOString().split("T")[0];
}
