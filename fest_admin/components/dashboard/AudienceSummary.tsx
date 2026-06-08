"use client";

import Link from "next/link";
import { DashboardData } from "@/types";

interface AudienceSummaryProps {
  metrics: DashboardData | null;
  activeEventId: string | undefined;
}

export default function AudienceSummary({
  metrics,
  activeEventId,
}: AudienceSummaryProps) {
  const totalTickets = metrics?.totalTicketsCount ?? 0;
  const male = metrics?.genderStats?.male ?? 0;
  const female = metrics?.genderStats?.female ?? 0;
  const totalGender = male + female;
  
  const malePct = totalGender > 0 ? Math.round((male / totalGender) * 100) : 0;
  const femalePct = totalGender > 0 ? Math.round((female / totalGender) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Audiencia / Tickets Card */}
      <div className="lg:col-span-3 group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 p-6 transition-all duration-300 hover:border-[#66b2ff]/30 hover:bg-[#0c0c0e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4e4e52]/10 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Entradas y Audiencia</h3>
            <p className="text-xs text-[#acb9ca]/50">Distribución de público y venta de tickets</p>
          </div>
          <Link
            href={`/dashboard/tickets?event_id=${activeEventId || ""}`}
            className="flex items-baseline gap-1.5 bg-[#66b2ff]/5 border border-[#66b2ff]/20 px-4 py-2 rounded-xl hover:bg-[#66b2ff]/10 hover:border-[#66b2ff]/40 transition-all cursor-pointer group/tickets"
          >
            <span className="text-2xl font-black text-white">
              {totalTickets}
            </span>
            <span className="text-[11px] font-bold text-[#66b2ff] uppercase tracking-wider">
              Entradas
            </span>
            <svg className="w-3.5 h-3.5 text-[#66b2ff] ml-1 self-center transform group-hover/tickets:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Gender distribution visual progress bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#acb9ca] mb-2">
            <span>Género Declarado en Entradas</span>
            <span>Total: {totalGender} declarados</span>
          </div>

          {/* Progress bar split */}
          <div className="flex h-4 w-full rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/30 shadow-inner">
            {totalGender > 0 ? (
              <>
                <div
                  style={{ width: `${malePct}%` }}
                  className="bg-gradient-to-r from-[#2b6cb0] to-[#66b2ff] transition-all duration-500 flex items-center justify-center text-[9px] text-white font-extrabold"
                  title={`Hombres: ${male}`}
                >
                  {malePct > 10 && `${malePct}%`}
                </div>
                <div
                  style={{ width: `${femalePct}%` }}
                  className="bg-gradient-to-r from-[#d53f8c] to-[#f472b6] transition-all duration-500 flex items-center justify-center text-[9px] text-white font-extrabold"
                  title={`Mujeres: ${female}`}
                >
                  {femalePct > 10 && `${femalePct}%`}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-center text-[10px] text-[#acb9ca]/40 font-medium">
                Sin datos de género cargados
              </div>
            )}
          </div>

          {/* Gender Legend Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3.5 rounded-xl border border-blue-950/20 bg-blue-950/5 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#66b2ff] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] text-[#acb9ca]/60 font-semibold uppercase tracking-wider">Hombres</span>
                <span className="text-lg font-black text-white">
                  {male}{" "}
                  <span className="text-xs font-normal text-[#acb9ca]/70">({malePct}%)</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-pink-950/20 bg-pink-950/5 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f472b6] shrink-0" />
              <div className="flex flex-col">
                <span className="text-[11px] text-[#acb9ca]/60 font-semibold uppercase tracking-wider">Mujeres</span>
                <span className="text-lg font-black text-white">
                  {female}{" "}
                  <span className="text-xs font-normal text-[#acb9ca]/70">({femalePct}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
