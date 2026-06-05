import { NextRequest, NextResponse } from "next/server";

const CROSSMINT_API_URL = "https://staging.crossmint.com/api/2022-06-09";
const SERVER_KEY = process.env.CROSSMINT_SERVER_KEY!;
const COLLECTION_ID = "ef44838a-d62e-43ff-8baa-44fb186849b5";

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
      },
      lineItems: [
        {
          collectionLocator: `crossmint:${COLLECTION_ID}`,
          callData: {
            totalPrice: totalPrice,
            quantity: 1,
          },
        },
      ],
      recipient: {
        email: recipientEmail,
      },
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
