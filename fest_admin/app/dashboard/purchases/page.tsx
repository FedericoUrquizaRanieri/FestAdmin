"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { Purchase } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import PageHeader from "@/components/dashboard/PageHeader";
import PurchaseTable from "@/components/dashboard/purchases/PurchaseTable";
import LoadingSpinner from "@/components/LoadingSpinner";

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
    return <LoadingSpinner variant="section" />;
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Control de Compras"
        backHref={`/dashboard?event_id=${activeEvent.id}`}
        backLabel="Volver al Panel"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
          </span>
        }
        actions={
          <div className="text-xs font-semibold bg-amber-500/5 border border-amber-500/25 px-4 py-2 rounded-xl text-amber-400">
            Pendientes: {purchases.length} compras
          </div>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => fetchPurchases(activeEvent.id)} />
        </div>
      )}

      {loading && purchases.length === 0 ? (
        <LoadingSpinner variant="section" />
      ) : (
        <PurchaseTable purchases={purchases} activeEventId={activeEvent.id} />
      )}
    </main>
  );
}