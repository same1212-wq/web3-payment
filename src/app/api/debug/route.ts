import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.CROSSMINT_SERVER_KEY;
  return NextResponse.json({
    keyExists: !!key,
    keyPrefix: key?.substring(0, 20) ?? "not found",
  });
}
