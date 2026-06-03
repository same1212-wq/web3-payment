export const NEXAPAY_CONFIG = {
  apiUrl: "https://api.nexapay.one",
  sellerWallet: process.env.NEXT_PUBLIC_SELLER_WALLET!,
  webhookSecret: process.env.NEXAPAY_WEBHOOK_SECRET!,
};

export const PLANS = [
  { id: "basic", name: "Basic Plan", amount: "10.00", description: "Monthly 10 USD" },
  { id: "pro", name: "Pro Plan", amount: "30.00", description: "Monthly 30 USD" },
  { id: "business", name: "Business Plan", amount: "100.00", description: "Monthly 100 USD" },
];
