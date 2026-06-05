import { NextRequest, NextResponse } from "next/server";

const CROSSMINT_API_URL = "https://staging.crossmint.com/api/2022-06-09";
const SERVER_KEY = process.env.CROSSMINT_SERVER_KEY!;

// Polygon Amoy (Staging) の USDC トークンアドレス
const USDC_TOKEN_LOCATOR = "polygon-amoy:0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582";

export async function POST(req: NextRequest) {
  const { totalPrice, recipientEmail } = await req.json();

  const response = await fetch(`${CROSSMINT_API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": SERVER_KEY,
    },
    body: JSON.stringify({
      payment: {
        method: "stripe-payment-element",
        currency: "usd",
        receiptEmail: recipientEmail,
      },
      lineItems: [
        {
          tokenLocator: USDC_TOKEN_LOCATOR,
          executionParameters: {
            mode: "exact-in",
            amount: String(totalPrice),
          },
        },
      ],
      recipient: {
        email: recipientEmail,
      },
      locale: "ja-JP",
    }),
  });

  const data = await response.json();
  console.log("Crossmint response:", JSON.stringify(data, null, 2));
  return NextResponse.json(data);
}