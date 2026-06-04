"use client";
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import { useState, useEffect } from "react";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string;
const COLLECTION_ID = "ef44838a-d62e-43ff-8baa-44fb186849b5";

const PLANS = [
  { id: "try",   nameJP: "Try Plan",   descJP: "Try Plan",   priceJPY: 100000 },
  { id: "start", nameJP: "Start Plan", descJP: "Start Plan", priceJPY: 200000 },
  { id: "light", nameJP: "Light Plan", descJP: "Light Plan", priceJPY: 400000 },
  { id: "basic", nameJP: "Basic Plan", descJP: "Basic Plan", priceJPY: 500000 },
];

export default function CheckoutPage() {
  const [selected, setSelected] = useState<typeof PLANS[0] | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchRate = () => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=jpy")
      .then((r) => r.json())
      .then((data) => {
        const jpyPerUsdc = data["usd-coin"]?.jpy;
        if (jpyPerUsdc) {
          setRate(jpyPerUsdc);
          setUpdatedAt(new Date().toLocaleTimeString("ja-JP"));
        }
      })
      .catch(() => setRate(145))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    return () => clearInterval(interval);
  }, []);

  const toUsdc = (jpy: number) => {
    if (!rate) return "0";
    return (jpy / rate).toFixed(2);
  };

  return (
    <main style={{ maxWidth: "520px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px" }}>Web3 Payment</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          {loading ? "Loading..." : `1 USDC = JPY ${rate?.toFixed(2)}`}
        </p>
        {updatedAt && (
          <span style={{ fontSize: "11px", color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: "99px" }}>
            {updatedAt} updated
          </span>
        )}
        <button onClick={fetchRate} style={{ fontSize: "11px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Refresh
        </button>
      </div>

      {!selected ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              style={{ padding: "16px 20px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff", textAlign: "left", cursor: "pointer", transition: "border-color .15s" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#6366f1"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: "15px" }}>{plan.descJP}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#6366f1", fontSize: "15px" }}>JPY {plan.priceJPY.toLocaleString()}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                    {loading ? "..." : `approx. ${toUsdc(plan.priceJPY)} USDC`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "13px", marginBottom: "16px", padding: 0 }}>
            Back
          </button>
          <div style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{selected.descJP}</p>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, color: "#6366f1", margin: 0 }}>JPY {selected.priceJPY.toLocaleString()}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{`approx. ${toUsdc(selected.priceJPY)} USDC`}</p>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "8px 0 0" }}>
              {`Rate: 1 USDC = JPY ${rate?.toFixed(2)} (${updatedAt})`}
            </p>
          </div>
          <CrossmintProvider apiKey={CLIENT_API_KEY}>
            <CrossmintHostedCheckout
              lineItems={{
                collectionId: COLLECTION_ID,
                callData: {
                  totalPrice: toUsdc(selected.priceJPY),
                  quantity: 1,
                },
              }}
              payment={{
                crypto: { enabled: true },
                fiat: { enabled: true },
              }}
            />
          </CrossmintProvider>
        </div>
      )}
    </main>
  );
}