import { NextResponse } from "next/server";

/** Routing / Edge 確認用（DB に触れません） */
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() });
}
