"use client";

import Link from "next/link";
import { DashboardData } from "@/types";

interface FinanceSummaryProps {
  metrics: DashboardData | null;
  activeEventId: string | undefined;
}

export default function FinanceSummary({
  metrics,
  activeEventId,
}: FinanceSummaryProps) {
  const earnings = metrics?.totalTicketEarnings ?? 0;
  const expenses = metrics?.totalExpenses ?? 0;
  const netProfit = earnings - expenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <h2 className="text-sm font-bold uppercase text-[#66b2ff] tracking-widest mb-4">
        Resumen Financiero
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#0c0c0e] hover:shadow-[0_8px_20px_rgba(16,185,129,0.05)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#acb9ca]/70">Ingresos Totales (Venta)</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 select-all">
                {formatCurrency(earnings)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[#acb9ca]/50 flex items-center gap-1">
            <span className="font-semibold text-emerald-400">100%</span> recaudación por entradas validadas
          </div>
        </div>

        {/* Expenses Card */}
        <Link
          href={`/dashboard/expenses?event_id=${activeEventId || ""}`}
          className="group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:border-rose-500/40 hover:bg-[#0c0c0e] hover:shadow-[0_8px_20px_rgba(244,63,94,0.08)] cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-[#acb9ca]/70">Gastos Registrados</p>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1.5 select-all">
                  {formatCurrency(expenses)}
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
                    d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[#acb9ca]/50">
              Costos de producción, DJs, seguridad, barra, etc.
            </p>
          </div>
          <div className="mt-4 text-[11px] text-rose-400 group-hover:text-rose-300 font-bold flex items-center gap-1 transition-colors pt-2 border-t border-[#4e4e52]/10">
            <span>Ver planilla de gastos</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Net Profit Card */}
        <div
          className={`group relative overflow-hidden rounded-2xl border bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:bg-[#0c0c0e] ${
            netProfit >= 0
              ? "border-[#4e4e52]/20 hover:border-emerald-500/40 hover:shadow-[0_8px_20px_rgba(16,185,129,0.08)]"
              : "border-rose-950/30 hover:border-rose-500/40 hover:shadow-[0_8px_20px_rgba(244,63,94,0.08)]"
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-tr from-transparent via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
              netProfit >= 0 ? "to-emerald-500/5" : "to-rose-500/5"
            }`}
          />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-[#acb9ca]/70">Balance Neto</p>
              <h3
                className={`text-2xl md:text-3xl font-extrabold mt-1.5 select-all ${
                  netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {netProfit >= 0 ? "+" : ""}
                {formatCurrency(netProfit)}
              </h3>
            </div>
            <div
              className={`p-2.5 rounded-xl border ${
                netProfit >= 0
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-[#acb9ca]/50">
            {netProfit >= 0
              ? "El festival registra ganancias"
              : "El festival registra déficit financiero"}
          </div>
        </div>
      </div>
    </div>
  );
}
