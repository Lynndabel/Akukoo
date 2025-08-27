import { useCallback, useState } from "react";

// Generic client hook to call our Next.js API that proxies to Circle Gas Station
export function useSponsoredTx() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const sendSponsoredTx = useCallback(
    async (params: {
      to: `0x${string}`;
      data: `0x${string}`;
      value?: `0x${string}`; // hex value in wei
      chain: string; // e.g., "base-mainnet" | "polygon-mainnet" | "ethereum-sepolia"
      userId?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch("/api/circle/tx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to submit sponsored tx");
        setResult(json);
        return json;
      } catch (e: any) {
        setError(e?.message || "Unknown error");
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { sendSponsoredTx, isLoading, error, result };
}
