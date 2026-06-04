import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret.replace("whsec_", ""));
  hmac.update(payload);
  const expected = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-nexapay-signature") ?? "";
  const secret = process.env.NEXAPAY_WEBHOOK_SECRET ?? "";

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === "payment.succeeded") {
    const { transactionHash, amount } = event.data;
    console.log("Payment completed:", { transactionHash, amount });
  }

  return NextResponse.json({ received: true });
}
