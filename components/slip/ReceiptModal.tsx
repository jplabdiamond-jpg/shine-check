"use client";

import { useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { X, Printer } from "lucide-react";
import type { Slip, SlipItem, Store } from "@/types/database";

interface Props {
  slip: Slip & { items: SlipItem[] };
  store: Store;
  recipientName?: string;
  onClose: () => void;
}

export default function ReceiptModal({ slip, store, recipientName, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=400,height=700");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>領収書</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif; padding: 20px; font-size: 12px; color: #000; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 16px; letter-spacing: 4px; }
          .store-name { text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 4px; }
          .divider { border-top: 1px solid #000; margin: 8px 0; }
          .double-divider { border-top: 3px double #000; margin: 12px 0; }
          .total-amount { font-size: 24px; font-weight: bold; text-align: center; padding: 8px 0; letter-spacing: 2px; }
          .label { display: flex; justify-content: space-between; margin: 4px 0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-sm { font-size: 11px; }
          .mb-2 { margin-bottom: 8px; }
          .mt-2 { margin-top: 8px; }
          .recipient { font-size: 16px; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .seal-area { text-align: right; margin-top: 16px; font-size: 11px; color: #555; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  const subtotal = Number(slip.subtotal ?? 0);
  const taxAmount = Number(slip.tax_amount ?? 0);
  const serviceAmount = Number(slip.service_amount ?? 0);
  const totalAmount = Number(slip.total_amount ?? 0);
  const taxRate = Number(store.tax_rate ?? 0);
  const serviceRate = Number(store.service_rate ?? 0);
  const issueDate = slip.closed_at
    ? new Date(slip.closed_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E3E8EE]">
          <h2 className="font-semibold text-[#3C4257]">領収書プレビュー</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 btn-primary text-sm px-3 py-1.5">
              <Printer className="w-4 h-4" />印刷
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-[#F6F9FC]">
              <X className="w-5 h-5 text-[#8792A2]" />
            </button>
          </div>
        </div>

        {/* 領収書プレビュー */}
        <div className="overflow-y-auto flex-1 p-5">
          <div ref={printRef} className="receipt bg-white p-5 border border-gray-200 rounded-lg mx-auto max-w-[280px] font-mono text-xs">
            <div className="title text-center text-xl font-bold mb-4 tracking-[4px]">領　収　書</div>

            <div className="text-center mb-3">
              <p className="text-sm font-bold">{issueDate}</p>
            </div>

            <div className="double-divider" style={{ borderTop: "3px double #000", margin: "10px 0" }} />

            <div className="mb-3">
              <p className="recipient" style={{ fontSize: "15px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "3px" }}>
                {recipientName ? `${recipientName}　様` : "　　　　　　　　　　　様"}
              </p>
            </div>

            <div className="total-amount text-center mb-3" style={{ fontSize: "22px", fontWeight: "bold", letterSpacing: "2px" }}>
              {formatCurrency(totalAmount)} -
            </div>

            <div className="double-divider" style={{ borderTop: "3px double #000", margin: "10px 0" }} />

            {/* 但し書き */}
            <div className="label" style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
              <span>但</span><span>飲食代として</span>
            </div>

            <div className="divider" style={{ borderTop: "1px solid #000", margin: "8px 0" }} />

            {/* 内訳 */}
            <div className="mb-2">
              <div className="label text-sm" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "3px 0" }}>
                <span>小計</span><span>{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="label text-sm" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "3px 0" }}>
                  <span>消費税（{taxRate}%）</span><span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {serviceAmount > 0 && (
                <div className="label text-sm" style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", margin: "3px 0" }}>
                  <span>サービス料（{serviceRate}%）</span><span>{formatCurrency(serviceAmount)}</span>
                </div>
              )}
            </div>

            <div className="divider" style={{ borderTop: "1px solid #000", margin: "8px 0" }} />

            {/* 店舗情報 */}
            <div className="text-center mt-3">
              <p className="store-name font-bold" style={{ fontSize: "14px" }}>{store.name}</p>
              <p className="text-sm mt-1" style={{ fontSize: "10px" }}>No. {slip.slip_number}</p>
            </div>

            <div className="seal-area" style={{ textAlign: "right", marginTop: "16px", fontSize: "10px", color: "#555" }}>
              （印）
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
