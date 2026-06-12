"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { Purchase } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import PurchaseHeader from "@/components/dashboard/purchases/PurchaseHeader";
import PurchaseTable from "@/components/dashboard/purchases/PurchaseTable";

export default function PurchasesPage() {
  const { activeEvent } = useDashboard();
  
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/purchases?event_id=${eventId}`);
      if (!response.ok) {
        throw new Error("Error al obtener las compras del evento.");
      }
      const data = await response.json();
      setPurchases(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEvent) {
      fetchPurchases(activeEvent.id);
    }
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="py-20 flex justify-center bg-[#080808] min-h-screen">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PurchaseHeader activeEvent={activeEvent} pendingCount={purchases.length} />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => fetchPurchases(activeEvent.id)} />
        </div>
      )}

      {loading && purchases.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        </div>
      ) : (
        <PurchaseTable purchases={purchases} activeEventId={activeEvent.id} />
      )}
    </main>
  );
}