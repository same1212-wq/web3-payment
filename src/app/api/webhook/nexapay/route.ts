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
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log("NexaPay event received:", event.type);

  if (event.type === "payment.succeeded") {
    const { transactionHash, amount, buyerEmail } = event.data;
    console.log("åàçœäÆóπ:", { transactionHash, amount, buyerEmail });
    // Ç±Ç±Ç…DBï€ë∂ÅEÉÅÅ[Éãí ímÇí«â¡
  }

  return NextResponse.json({ received: true });
}
