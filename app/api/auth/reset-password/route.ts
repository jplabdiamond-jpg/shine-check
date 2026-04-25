import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

const BASE_URL = process.env.NEXTAUTH_URL || "https://check.yoru-navi-shine.com";
const FROM_EMAIL = process.env.SMTP_USER || "night.job.recruit@gmail.com";

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
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // ユーザー存在確認（存在しない場合も成功を返す=メール列挙攻撃対策）
    const users = await sql`
      SELECT id, email, name FROM store_users
      WHERE email = ${trimmedEmail} AND is_active = true
      LIMIT 1
    `;

    if (users.length === 0) {
      console.log(`[RESET] Email not found: ${trimmedEmail} (returning success for security)`);
      return NextResponse.json({ success: true });
    }

    const user = users[0] as { id: string; email: string; name: string };

    // 既存の未使用トークンを無効化
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE user_id = ${user.id} AND used_at IS NULL
    `;

    // 新トークン生成（1時間有効）
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `;

    const resetUrl = `${BASE_URL}/reset-password/confirm?token=${token}`;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Shine Check" <${FROM_EMAIL}>`,
      to: user.email,
      subject: "【Shine Check】パスワードリセットのご案内",
      text: [
        `${user.name || user.email} 様`,
        "",
        "Shine Check のパスワードリセットがリクエストされました。",
        "以下のURLをクリックして新しいパスワードを設定してください。",
        "",
        resetUrl,
        "",
        "※このURLの有効期限は1時間です。",
        "※このメールに心当たりがない場合は無視してください。",
        "",
        "---",
        "Shine Check 運営チーム",
        "夜職ナビ Shine 運営委員会",
      ].join("\n"),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#1A0A14,#3D0A22);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
            <h2 style="color:#FF6BA8;margin:0;font-size:20px;letter-spacing:2px;">Shine Check</h2>
            <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">夜職勘定サポート</p>
          </div>
          <div style="background:#fff;padding:28px;border:1px solid #FFD6E7;border-top:none;border-radius:0 0 12px 12px;">
            <p style="color:#3C2233;margin:0 0 16px;font-size:15px;">${(user.name || user.email).replace(/</g,"&lt;")} 様</p>
            <p style="color:#555;margin:0 0 20px;line-height:1.7;">パスワードリセットがリクエストされました。<br>下のボタンから新しいパスワードを設定してください。</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${resetUrl}"
                style="display:inline-block;background:#FF2D78;color:white;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;">
                パスワードを再設定する
              </a>
            </div>
            <p style="color:#A07090;font-size:13px;margin:20px 0 0;text-align:center;">
              ※ このURLの有効期限は<strong>1時間</strong>です。<br>
              ※ このメールに心当たりがない場合は無視してください。
            </p>
            <hr style="margin:24px 0;border:none;border-top:1px solid #FFD6E7;">
            <p style="color:#aaa;font-size:12px;margin:0;text-align:center;">Shine Check 運営チーム / 夜職ナビ Shine 運営委員会</p>
          </div>
        </div>
      `,
    });

    console.log(`[RESET] Token sent to ${trimmedEmail}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[RESET] ERROR:", e);
    return NextResponse.json({ error: "処理に失敗しました", detail: String(e) }, { status: 500 });
  }
}
