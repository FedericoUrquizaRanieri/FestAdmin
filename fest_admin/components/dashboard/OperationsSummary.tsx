"use client";

import Link from "next/link";
import { DashboardData } from "@/types";

interface OperationsSummaryProps {
  metrics: DashboardData | null;
  activeEventId: string | undefined;
}

export default function OperationsSummary({
  metrics,
  activeEventId,
}: OperationsSummaryProps) {
  const activeChats = metrics?.activeConversationsCount ?? 0;
  const salesChats = metrics?.conversationsWithSalesCount ?? 0;
  const pendingApprovals = metrics?.purchasesPendingApprovalCount ?? 0;

  return (
    <div>
      <h2 className="text-sm font-bold uppercase text-[#66b2ff] tracking-widest mb-4">
        Flujo de Conversación y Operaciones
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Chats Card */}
        <Link
          href={`/dashboard/conversations?event_id=${activeEventId || ""}`}
          className="group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:border-[#66b2ff]/40 hover:bg-[#0c0c0e] hover:shadow-[0_8px_20px_rgba(102,178,255,0.05)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-medium text-[#acb9ca]/70">Chats Activos</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {activeChats}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-[#66b2ff]/10 text-[#66b2ff] border border-[#66b2ff]/20">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-[#acb9ca]/60 leading-relaxed">
              Chats en WhatsApp en estado <span className="font-semibold text-white">IDLE</span>,{" "}
              <span className="font-semibold text-white">WAITING_PAYMENT</span> o{" "}
              <span className="font-semibold text-white">WAITING_CONFIRMATION</span>.
            </p>
          </div>
          <div className="mt-4 text-[11px] text-[#66b2ff] group-hover:text-[#84d2ff] font-bold flex items-center gap-1 transition-colors pt-2 border-t border-[#4e4e52]/10">
            <span>Ir al panel de chats</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Conversiones con Ventas Card */}
        <Link
          href={`/dashboard/purchases?event_id=${activeEventId || ""}`}
          className="group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:border-cyan-500/40 hover:bg-[#0c0c0e] hover:shadow-[0_8px_20px_rgba(6,182,212,0.05)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-medium text-[#acb9ca]/70">Chats con Ventas</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {salesChats}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
            <p className="text-[11px] text-[#acb9ca]/60 leading-relaxed">
              Conversaciones que derivaron en compras <span className="font-semibold text-white">PAID</span>,{" "}
              <span className="font-semibold text-white">PENDING</span> o{" "}
              <span className="font-semibold text-white">PARTIALLY_PAID</span>.
            </p>
          </div>
          <div className="mt-4 text-[11px] text-cyan-400 group-hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors pt-2 border-t border-[#4e4e52]/10">
            <span>Ver listado de compras</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Pending Approvals Card */}
        <Link
          href={`/dashboard/purchases?event_id=${activeEventId || ""}`}
          className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
            pendingApprovals > 0
              ? "border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20 hover:border-amber-500/50"
              : "border-[#4e4e52]/20 bg-[#0c0c0e]/40 hover:border-amber-500/20 hover:bg-[#0c0c0e]"
          }`}
        >
          <div>
            {pendingApprovals > 0 && (
              <div className="absolute top-0 right-0 w-2 h-2 rounded-bl-xl bg-amber-400 animate-pulse" />
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-medium text-[#acb9ca]/70">Acreditaciones Pendientes</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {pendingApprovals}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  pendingApprovals > 0
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-zinc-800 text-[#acb9ca] border-zinc-700"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-[#acb9ca]/60 leading-relaxed">
                Transferencias bancarias adjuntadas por los compradores pendientes de verificación manual.
              </p>
              {pendingApprovals > 0 && (
                <span className="inline-flex self-start items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                  ⚠️ Requiere Acción
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 text-[11px] text-amber-400 group-hover:text-amber-300 font-bold flex items-center gap-1 transition-colors pt-2 border-t border-[#4e4e52]/10">
            <span>Revisar acreditaciones</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
