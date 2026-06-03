"use client";
import { useState } from "react";
import { PLANS } from "@/lib/nexapay";

export default function CheckoutPage() {
  const [selected, setSelected] = useState<typeof PLANS[0] | null>(null);

  return (
    <main className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-medium mb-2">Payment</h1>
      <p className="text-sm text-gray-500 mb-8">Select a plan</p>
      {!selected ? (
        <div className="flex flex-col gap-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              className="p-4 border border-gray-200 rounded-xl text-left hover:border-indigo-400 transition-colors"
            >
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 mb-4">
            Back
          </button>
          <div className="p-6 border border-gray-200 rounded-xl text-center">
            <p className="text-lg font-medium mb-2">{selected.name}</p>
            <p className="text-3xl font-bold mb-6">${selected.amount}</p>
            <p className="text-sm text-gray-400">NexaPay widget will be embedded here</p>
          </div>
        </div>
      )}
    </main>
  );
}
