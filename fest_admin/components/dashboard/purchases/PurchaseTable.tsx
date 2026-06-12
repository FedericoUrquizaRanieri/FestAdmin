"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Purchase } from "@/types";
import { formatLocalDate } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

interface PurchaseTableProps {
  purchases: Purchase[];
  activeEventId: string;
}

export default function PurchaseTable({
  purchases,
  activeEventId,
}: PurchaseTableProps) {
  const router = useRouter();
  
  // Pagination State
  const [page, setPage] = useState(0);
  const limit = 10;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (state: string | null) => {
    switch (state) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-405 border border-amber-500/25 uppercase tracking-wider animate-pulse">
            ● Pendiente
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[#66b2ff] border border-sky-500/20 uppercase tracking-wider">
            ● Pago Parcial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase tracking-wider">
            ● {state || "Desconocido"}
          </span>
        );
    }
  };

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon="🎫"
        title="Sin compras pendientes"
        description="No hay compras que requieran verificación manual en este festival en este momento."
      />
    );
  }

  const totalCount = purchases.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedPurchases = purchases.slice(page * limit, (page + 1) * limit);

  const startItem = totalCount === 0 ? 0 : page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalCount);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/30 shadow-xl animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-[11px] font-bold text-[#acb9ca]/60 uppercase tracking-wider">
              <th className="py-4 px-6">Teléfono del Comprador</th>
              <th className="py-4 px-6">Fecha de Solicitud</th>
              <th className="py-4 px-6 text-right">Monto Total</th>
              <th className="py-4 px-6 text-right">Monto Abonado</th>
              <th className="py-4 px-6 text-center">Estado</th>
              <th className="py-4 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4e4e52]/10 text-sm text-[#acb9ca]/85">
            {paginatedPurchases.map((p) => {
              const phone = p.conversations?.phone_number || p.buyer_phone || "Desconocido";

              return (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/dashboard/purchases/${p.id}?event_id=${activeEventId}`)}
                  className="group hover:bg-[#0c0c0e]/60 cursor-pointer transition-colors duration-150"
                >
                  <td className="py-4 px-6 font-semibold text-white group-hover:text-[#66b2ff] transition-colors select-all">
                    {phone}
                  </td>
                  <td className="py-4 px-6 text-xs text-[#acb9ca]/70">
                    {formatLocalDate(p.created_at)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-white">
                    {formatCurrency(p.total_amount)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-emerald-400">
                    {formatCurrency(p.paid_amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(p.state)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#66b2ff] group-hover:text-white font-semibold transition-colors">
                      Verificar
                      <svg
                        className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#4e4e52]/10 bg-[#0c0c0e]/40">
          <div className="text-xs text-[#acb9ca]/60">
            Mostrando <span className="font-semibold text-white">{startItem}</span> a{" "}
            <span className="font-semibold text-white">{endItem}</span> de{" "}
            <span className="font-semibold text-white">{totalCount}</span> compras
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-[#66b2ff]/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
            >
              Anterior
            </button>
            <div className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
              Página {page + 1} de {totalPages}
            </div>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-[#66b2ff]/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
