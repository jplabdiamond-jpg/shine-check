import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import nodemailer from "nodemailer";

const SERVICE_NAME = "Shine Check（水商売向け伝票管理SaaS）";
const ADMIN_EMAIL = "night.job.recruit@gmail.com";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { category, message } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "メッセージを入力してください" }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "2000文字以内で入力してください" }, { status: 400 });
    }

    const userEmail = session.user.email;
    const userName = (session.user as { name?: string }).name ?? userEmail;
    const submittedAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const categoryLabel = category || "未分類";

    const transporter = createTransporter();

    // 1. 運営へ通知メール
    await transporter.sendMail({
      from: `"${SERVICE_NAME}" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `【${SERVICE_NAME}】フィードバック受信：${categoryLabel}`,
      text: [
        `${SERVICE_NAME} にフィードバックが届きました。`,
        "",
        `■ カテゴリ: ${categoryLabel}`,
        `■ 送信日時: ${submittedAt}`,
        `■ 送信者: ${userName}（${userEmail}）`,
        "",
        "■ 内容:",
        message,
        "",
        "---",
        "このメールは Shine Check システムから自動送信されました。",
      ].join("\n"),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#FF2D78;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:18px;">📬 フィードバック受信</h2>
            <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">${SERVICE_NAME}</p>
          </div>
          <div style="background:#f9f9f9;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:110px;">カテゴリ</td><td style="padding:6px 0;font-weight:600;">${categoryLabel}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">送信日時</td><td style="padding:6px 0;">${submittedAt}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">送信者</td><td style="padding:6px 0;">${userName}<br><a href="mailto:${userEmail}" style="color:#FF2D78;">${userEmail}</a></td></tr>
            </table>
            <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;">
            <p style="margin:0 0 8px;font-weight:600;color:#333;">内容：</p>
            <div style="background:white;padding:14px;border-radius:6px;border:1px solid #ddd;white-space:pre-wrap;color:#333;font-size:14px;line-height:1.6;">${message.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
          </div>
        </div>
      `,
    });

    // 2. ユーザーへ確認メール
    await transporter.sendMail({
      from: `"${SERVICE_NAME}" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: `【${SERVICE_NAME}】フィードバックを受け付けました`,
      text: [
        `${userName} 様`,
        "",
        `この度は ${SERVICE_NAME} へのフィードバックをお送りいただき、ありがとうございます。`,
        "以下の内容を受け付けました。",
        "",
        `■ カテゴリ: ${categoryLabel}`,
        `■ 送信日時: ${submittedAt}`,
        "",
        "■ 内容:",
        message,
        "",
        "内容を確認の上、改善に活かしてまいります。",
        "引き続き Shine Check をよろしくお願いいたします。",
        "",
        "---",
        SERVICE_NAME + " 運営チーム",
        "夜職ナビ Shine 運営委員会",
        ADMIN_EMAIL,
      ].join("\n"),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#FF2D78;padding:16px 20px;border-radius:8px 8px 0 0;">
            <h2 style="color:white;margin:0;font-size:18px;">✅ フィードバックを受け付けました</h2>
            <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">${SERVICE_NAME}</p>
          </div>
          <div style="background:#f9f9f9;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;">
            <p style="color:#333;margin:0 0 16px;">${userName} 様<br><br>${SERVICE_NAME} へのフィードバックをお送りいただき、ありがとうございます。以下の内容を受け付けました。</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:6px 0;color:#666;width:110px;">カテゴリ</td><td style="padding:6px 0;font-weight:600;">${categoryLabel}</td></tr>
              <tr><td style="padding:6px 0;color:#666;">送信日時</td><td style="padding:6px 0;">${submittedAt}</td></tr>
            </table>
            <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;">
            <p style="margin:0 0 8px;font-weight:600;color:#333;">送信内容：</p>
            <div style="background:white;padding:14px;border-radius:6px;border:1px solid #ddd;white-space:pre-wrap;color:#333;font-size:14px;line-height:1.6;">${message.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</div>
            <p style="margin:20px 0 0;color:#666;font-size:13px;">内容を確認の上、改善に活かしてまいります。引き続き ${SERVICE_NAME} をよろしくお願いいたします。</p>
            <hr style="margin:20px 0;border:none;border-top:1px solid #ddd;">
            <p style="color:#aaa;font-size:12px;margin:0;">${SERVICE_NAME} 運営チーム・夜職ナビ Shine 運営委員会<br>${ADMIN_EMAIL}</p>
          </div>
        </div>
      `,
    });

    console.log(`[FEEDBACK] Sent from ${userEmail}, category: ${categoryLabel}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[FEEDBACK] ERROR:", e);
    return NextResponse.json({ error: "送信に失敗しました", detail: String(e) }, { status: 500 });
  }
}
