"use client";
import { CrossmintProvider, CrossmintHostedCheckout } from "@crossmint/client-sdk-react-ui";
import { useState, useEffect } from "react";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_KEY as string;

const PLANS = [
  { id: "try",   nameJP: "Try Plan",   descJP: "トライプラン",   priceJPY: 100000, collectionId: "crossmint:ef44838a-d62e-43ff-8baa-44fb186849b5" },
  { id: "start", nameJP: "Start Plan", descJP: "スタートプラン", priceJPY: 200000, collectionId: "crossmint:ef44838a-d62e-43ff-8baa-44fb186849b5" },
  { id: "light", nameJP: "Light Plan", descJP: "ライトプラン",   priceJPY: 400000, collectionId: "crossmint:ef44838a-d62e-43ff-8baa-44fb186849b5" },
  { id: "basic", nameJP: "Basic Plan", descJP: "ベーシックプラン", priceJPY: 500000, collectionId: "crossmint:ef44838a-d62e-43ff-8baa-44fb186849b5" },
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
    if (!rate) return "---";
    return (jpy / rate).toFixed(2);
  };

  return (
    <main style={{ maxWidth: "520px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "4px" }}>
        Web3 Payment
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          {loading ? "Loading..." : `1 USDC = ¥${rate?.toFixed(2)}`}
        </p>
        {updatedAt && (
          <span style={{ fontSize: "11px", color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: "99px" }}>
            {updatedAt} updated
          </span>
        )}
        <button
          onClick={fetchRate}
          style={{ fontSize: "11px", color: "#6366f1", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Refresh
        </button>
      </div>

      {!selected ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              style={{
                padding: "16px 20px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                background: "#fff",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color .15s, box-shadow .15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: "15px" }}>{plan.descJP}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{plan.nameJP}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#6366f1", fontSize: "15px" }}>
                    ¥{plan.priceJPY.toLocaleString()}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                    {loading ? "..." : `≈ ${toUsdc(plan.priceJPY)} USDC`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelected(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "13px", marginBottom: "16px", padding: 0 }}
          >
            Back
          </button>
          <div style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{selected.descJP}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{selected.nameJP}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, color: "#6366f1", margin: 0 }}>¥{selected.priceJPY.toLocaleString()}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                  {`≈ ${toUsdc(selected.priceJPY)} USDC`}
                </p>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "8px 0 0" }}>
              {`レート: 1 USDC = ¥${rate?.toFixed(2)} (${updatedAt} updated)`}
            </p>
          </div>
          <CrossmintProvider apiKey={CLIENT_API_KEY}>
            <CrossmintHostedCheckout
              lineItems={{
                collectionLocator: selected.collectionId,
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
