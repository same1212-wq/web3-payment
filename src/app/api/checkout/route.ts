import { NextRequest, NextResponse } from "next/server";

const CROSSMINT_API_URL = "https://staging.crossmint.com/api/2022-06-09";
const SERVER_KEY = process.env.CROSSMINT_SERVER_KEY!;
const COLLECTION_ID = "ef44838a-d62e-43ff-8baa-44fb186849b5";

export async function POST(req: NextRequest) {
  const { totalPrice, recipientEmail, walletAddress } = await req.json();

  // recipientの設定：ウォレットアドレスがあればそちらを優先
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