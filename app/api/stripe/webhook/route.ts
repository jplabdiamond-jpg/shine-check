import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";
import Stripe from "stripe";

const sql = neon(process.env.DATABASE_URL!);

// Next.js App Router: bodyをRawで受け取るためexportが必要
export const dynamic = "force-dynamic";

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const storeId = subscription.metadata?.store_id;
  if (!storeId) {
    console.warn("[webhook] subscription has no store_id metadata");
    return;
  }

  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";
  const plan = isActive ? "premium" : "standard";
  const expiresAt = isActive
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  await sql`
    UPDATE stores SET
      plan = ${plan},
      stripe_subscription_id = ${subscription.id},
      plan_expires_at = ${expiresAt},
      updated_at = NOW()
    WHERE id = ${storeId}
  `;

  console.log(`[webhook] store ${storeId} plan updated to ${plan} (status: ${status})`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const storeId = session.metadata?.store_id;
  if (!storeId || !session.subscription) return;

  // サブスクリプション詳細取得
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  await handleSubscriptionUpdate(subscription);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          await handleSubscriptionUpdate(sub);
        }
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }
  } catch (error) {
    console.error("[webhook] Handler error:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
