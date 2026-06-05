import { NextRequest, NextResponse } from "next/server";

const CROSSMINT_API_URL = "https://www.crossmint.com/api/2022-06-09";
const SERVER_KEY = process.env.CROSSMINT_SERVER_KEY!;
const COLLECTION_ID = "2abd6a46-5fc8-4141-9d69-b9f474ab5ece";

export async function POST(req: NextRequest) {
  const { totalPrice, recipientEmail, walletAddress } = await req.json();

  const recipient = walletAddress
    ? { walletAddress }
    : { email: recipientEmail };

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
          collectionLocator: `crossmint:${COLLECTION_ID}`,
          callData: {
            totalPrice: String(totalPrice),
            quantity: 1,
          },
        },
      ],
      recipient,
      locale: "ja-JP",
    }),
  });

  const data = await response.json();
  console.log("Crossmint quote:", JSON.stringify(data?.order?.quote, null, 2));
  return NextResponse.json(data);
}