// Supabase移行済み - middlewareはNextAuth (middleware.ts) が担当
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request });
}
