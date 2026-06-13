"use client";

import { Purchase } from "@/types";
import { formatLocalDate } from "@/lib/utils";

interface PurchaseInfoCardProps {
  purchase: Purchase;
}

export default function PurchaseInfoCard({ purchase: p }: PurchaseInfoCardProps) {
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
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 uppercase tracking-wider animate-pulse">
            ● Pendiente de Pago
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-sky-500/10 text-[#66b2ff] border border-sky-500/20 uppercase tracking-wider">
            ● Abonado Parcialmente
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-405 border border-emerald-500/20 uppercase tracking-wider">
            ● Abonado Completo
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-wider">
            ● Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 uppercase tracking-wider">
            ● {state || "Desconocido"}
          </span>
        );
    }
  };

  const buyerContact = p.buyer_phone || "Desconocido";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 shadow-xl mb-8 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#66b2ff]/5 pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4e4e52]/10 pb-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Resumen de la Compra
          </h2>
          <p className="text-[10px] text-[#acb9ca]/40 mt-0.5 select-all">
            ID: {p.id}
          </p>
        </div>
        <div>{getStatusBadge(p.state)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Contact info */}
        <div>
          <p className="text-[10px] font-bold text-[#acb9ca]/50 uppercase tracking-wider">
            Contacto del Comprador
          </p>
          <p className="text-sm font-bold text-white mt-1 select-all">
            {buyerContact}
          </p>
        </div>

        {/* Request Date */}
        <div>
          <p className="text-[10px] font-bold text-[#acb9ca]/50 uppercase tracking-wider">
            Fecha de Solicitud
          </p>
          <p className="text-sm font-bold text-white mt-1">
            {formatLocalDate(p.created_at)}
          </p>
        </div>

        {/* Total Amount */}
        <div>
          <p className="text-[10px] font-bold text-[#acb9ca]/50 uppercase tracking-wider">
            Monto Total de Entradas
          </p>
          <p className="text-sm font-black text-white mt-1 select-all">
            {formatCurrency(p.total_amount)}
          </p>
        </div>

        {/* Paid Amount */}
        <div>
          <p className="text-[10px] font-bold text-[#acb9ca]/50 uppercase tracking-wider">
            Monto Registrado / Validado
          </p>
          <p className="text-sm font-black text-emerald-450 mt-1 select-all">
            {formatCurrency(p.paid_amount)}
          </p>
        </div>
      </div>
    </div>
  );
}
