import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { stripe, STRIPE_PREMIUM_PRICE_ID } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = session.user.storeId;

    // 店舗情報取得
    const [store] = await sql`
      SELECT id, name, stripe_customer_id, plan
      FROM stores
      WHERE id = ${storeId}
    `;

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.plan === "premium") {
      return NextResponse.json(
        { error: "Already on premium plan" },
        { status: 400 }
      );
    }

    // Stripe Customer取得 or 作成
    let stripeCustomerId = store.stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        name: store.name,
        metadata: { store_id: storeId },
      });
      stripeCustomerId = customer.id;

      await sql`
        UPDATE stores SET stripe_customer_id = ${stripeCustomerId} WHERE id = ${storeId}
      `;
    }

    const appUrl = getAppUrl();

    // Checkout Session作成
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/settings?upgraded=true`,
      cancel_url: `${appUrl}/settings?canceled=true`,
      metadata: { store_id: storeId },
      subscription_data: {
        metadata: { store_id: storeId },
      },
      locale: "ja",
    });

    console.log(`[stripe/checkout] Created session for store ${storeId}`);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout] ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
