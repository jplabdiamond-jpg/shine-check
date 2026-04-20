import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { stripe } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = session.user.storeId;
    const [store] = await sql`
      SELECT stripe_customer_id FROM stores WHERE id = ${storeId}
    `;

    if (!store?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: store.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    console.log(`[stripe/portal] Created portal session for store ${storeId}`);
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[stripe/portal] ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
