"use client";
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string;
const COLLECTION_ID = "crossmint:ef44838a-d62e-43ff-8baa-44fb186849b5";

export default function CheckoutPage() {
  return (
    <main style={{ maxWidth: "480px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 500, marginBottom: "8px" }}>Service Payment</h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px" }}>
        Please complete your payment below.
      </p>
      <CrossmintProvider apiKey={CLIENT_API_KEY}>
        <CrossmintHostedCheckout
          lineItems={{
            collectionLocator: COLLECTION_ID,
            callData: {
              totalPrice: "10.00",
              quantity: 1,
            },
          }}
          payment={{
            crypto: { enabled: true },
            fiat: { enabled: true },
          }}
        />
      </CrossmintProvider>
    </main>
  );
}
