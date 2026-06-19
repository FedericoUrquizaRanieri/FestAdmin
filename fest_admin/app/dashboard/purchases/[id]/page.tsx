"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Purchase } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import PurchaseInfoCard from "@/components/dashboard/purchases/detail/PurchaseInfoCard";
import TransferList from "@/components/dashboard/purchases/detail/TransferList";
import PageHeader from "@/components/dashboard/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PurchaseDetailPage() {
  const params = useParams();
  const purchaseId = params.id as string;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | number | null>(null);

  const fetchPurchaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`);
      if (!response.ok) {
        throw new Error("Error al obtener los detalles de la compra.");
      }
      const data = await response.json();
      setPurchase(data);
    } catch (err) {
      setError((err as Error).message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      Promise.resolve().then(() => fetchPurchaseDetails());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseId]);

  const handleUpdateTransferState = async (
    transferId: string | number,
    state: "APPROVED" | "REJECTED"
  ) => {
    setTransitioningId(transferId);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transfer_id: transferId,
          state,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del comprobante.");
      }

      // Update local state for the modified transfer
      setPurchase((prev) => {
        if (!prev) return null;
        
        const updatedTransfers = prev.transfer_auth?.map((t) =>
          t.id.toString() === transferId.toString() ? { ...t, state } : t
        ) || [];

        return {
          ...prev,
          transfer_auth: updatedTransfers,
        };
      });
    } catch (err) {
      alert((err as Error).message || "Error al actualizar el comprobante.");
    } finally {
      setTransitioningId(null);
    }
  };

  if (loading && !purchase) {
    return <LoadingSpinner />;
  }

  if (error || !purchase) {
    return (
      <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808]">
        <ErrorMessage
          message={error || "No se pudo encontrar la información de la compra."}
          onRetry={fetchPurchaseDetails}
        />
      </main>
    );
  }

  const activeEventId = purchase.event_id || "";

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Verificación de Pago"
        backHref={`/dashboard/purchases?event_id=${activeEventId}`}
        backLabel="Volver a la Lista"
        subtitle="Aprobá o rechazá las transferencias asociadas a esta compra para validar la entrega de tickets"
        borderBottom={false}
      />


      <div className="flex flex-col gap-6">
        {/* Info Card */}
        <PurchaseInfoCard purchase={purchase} />

        {/* Transfer list with mock receipts */}
        <TransferList
          transfers={purchase.transfer_auth || []}
          onUpdateState={handleUpdateTransferState}
          transitioningId={transitioningId}
        />
      </div>
    </main>
  );
}