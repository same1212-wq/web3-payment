"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PLANS = [
  { id: "try",   name: "Try Plan",   priceJPY: 100000 },
  { id: "start", name: "Start Plan", priceJPY: 200000 },
  { id: "light", name: "Light Plan", priceJPY: 400000 },
  { id: "basic", name: "Basic Plan", priceJPY: 500000 },
];

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setError(error.message ?? "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={{ color: "red", fontSize: "13px", marginTop: "8px" }}>{error}</p>}
      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: "16px", width: "100%", padding: "14px",
          background: loading ? "#9ca3af" : "#6366f1", color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "15px",
          fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const [selected, setSelected] = useState<typeof PLANS[0] | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paid, setPaid] = useState(false);

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
      .catch(() => setRate(155))
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

  const handleProceed = async () => {
    if (!selected || !email) return;
    setOrderLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPrice: toUsdc(selected.priceJPY),
          recipientEmail: email,
        }),
      });
      const data = await res.json();

      // レスポンス構造を柔軟に対応
      const stripeKey =
        data.payment?.stripePublishableKey ||
        data.stripePublishableKey;

      const secret =
        data.payment?.preparation?.stripeClientSecret ||
        data.payment?.clientSecret ||
        data.clientSecret;

      if (stripeKey && secret) {
        const stripe = loadStripe(stripeKey);
        setStripePromise(stripe);
        setClientSecret(secret);
      } else {
        console.error("Unexpected response:", JSON.stringify(data));
        alert("Order creation failed. Please try again.\n\n" + JSON.stringify(data, null, 2));
      }
    } catch (e) {
      alert("Error: " + e);
    } finally {
      setOrderLoading(false);
    }
  };

  if (paid) {
    return (
      <main style={{ maxWidth: "520px", margin: "60px auto", padding: "0 16px", fontFamily: "sans-serif", textAlign: "center" }}>
        <h1 style={{ fontSize: "24px", color: "#6366f1" }}>Payment Complete!</h1>
        <p style={{ color: "#6b7280" }}>Thank you. Your NFT will be delivered shortly.</p>
      </main>
    );
  }

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
              style={{ padding: "16px 20px", border: "1px solid #e5e7eb", borderRadius: "12px", background: "#fff", textAlign: "left", cursor: "pointer" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#6366f1"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{plan.name}</p>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#6366f1" }}>JPY {plan.priceJPY.toLocaleString()}</p>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                    {loading ? "..." : `approx. ${toUsdc(plan.priceJPY)} USDC`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : !clientSecret ? (
        <div>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: "13px", marginBottom: "16px", padding: 0 }}>
            Back
          </button>
          <div style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{selected.name}</p>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, color: "#6366f1", margin: 0 }}>JPY {selected.priceJPY.toLocaleString()}</p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>{`approx. ${toUsdc(selected.priceJPY)} USDC`}</p>
              </div>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "8px 0 0" }}>
              {`Rate: 1 USDC = JPY ${rate?.toFixed(2)} (${updatedAt})`}
            </p>
          </div>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", marginBottom: "12px", boxSizing: "border-box" }}
          />
          <button
            onClick={handleProceed}
            disabled={orderLoading || !email}
            style={{
              width: "100%", padding: "14px",
              background: orderLoading || !email ? "#9ca3af" : "#6366f1",
              color: "#fff", border: "none", borderRadius: "8px",
              fontSize: "15px", fontWeight: 600, cursor: orderLoading || !email ? "not-allowed" : "pointer",
            }}
          >
            {orderLoading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ padding: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", marginBottom: "16px", background: "#f9fafb" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p style={{ fontWeight: 600, margin: 0 }}>{selected.name}</p>
              <p style={{ fontWeight: 700, color: "#6366f1", margin: 0 }}>JPY {selected.priceJPY.toLocaleString()}</p>
            </div>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "4px 0 0" }}>{`approx. ${toUsdc(selected.priceJPY)} USDC`}</p>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm onSuccess={() => setPaid(true)} />
          </Elements>
        </div>
      )}
    </main>
  );
}