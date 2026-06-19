"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboard } from "../layout";
import { Purchase } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import PageHeader from "@/components/dashboard/PageHeader";
import PurchaseTable from "@/components/dashboard/purchases/PurchaseTable";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PurchasesPage() {
  const { activeEvent } = useDashboard();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") || "all"; // "all" or "pending"

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPurchases = async (eventId: string) => {
    // Abort previous request if there is one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/purchases?event_id=${eventId}&status=${filter}`,
        { signal: controller.signal }
      );
      if (!response.ok) {
        throw new Error("Error al obtener las compras del evento.");
      }
      const data = await response.json();
      setPurchases(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Error al conectar con el servidor.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (activeEvent) {
      fetchPurchases(activeEvent.id);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [activeEvent, filter]);

  if (!activeEvent) {
    return <LoadingSpinner variant="section" />;
  }

  const isPendingFilter = filter === "pending";
  const pendingCount = purchases.filter((p) => p.state === "PENDING" || p.state === "PARTIALLY_PAID").length;
  const approvedCount = purchases.filter((p) => p.state === "PAID").length;

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title={isPendingFilter ? "Acreditaciones Pendientes" : "Control de Compras"}
        backHref={`/dashboard?event_id=${activeEvent.id}`}
        backLabel="Volver al Panel"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
          </span>
        }
        actions={
          isPendingFilter ? (
            <div className="text-xs font-semibold bg-amber-500/5 border border-amber-500/25 px-4 py-2 rounded-xl text-amber-400">
              Pendientes: {purchases.length} compras
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="text-xs font-semibold bg-emerald-500/5 border border-emerald-500/25 px-4 py-2 rounded-xl text-emerald-400 font-bold">
                Aprobadas: {approvedCount}
              </div>
              <div className="text-xs font-semibold bg-amber-500/5 border border-amber-500/25 px-4 py-2 rounded-xl text-amber-400 font-bold">
                Pendientes: {pendingCount}
              </div>
            </div>
          )
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
        <PurchaseTable purchases={purchases} activeEventId={activeEvent.id} filter={filter} />
      )}
    </main>
  );
}