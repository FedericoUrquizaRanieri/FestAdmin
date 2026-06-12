"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Purchase } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import PurchaseInfoCard from "@/components/dashboard/purchases/detail/PurchaseInfoCard";
import TransferList from "@/components/dashboard/purchases/detail/TransferList";

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
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseDetails();
    }
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
    } catch (err: any) {
      alert(err.message || "Error al actualizar el comprobante.");
    } finally {
      setTransitioningId(null);
    }
  };

  if (loading && !purchase) {
    return (
      <div className="py-20 flex justify-center bg-[#080808] min-h-screen">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
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
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/dashboard/purchases?event_id=${activeEventId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#acb9ca] hover:text-[#66b2ff] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la Lista
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Verificación de Pago
        </h1>
        <p className="text-sm text-[#acb9ca]/70 mt-1">
          Aprobá o rechazá las transferencias asociadas a esta compra para validar la entrega de tickets
        </p>
      </div>

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