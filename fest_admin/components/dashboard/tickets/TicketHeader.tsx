"use client";

import Link from "next/link";
import { Event } from "@/types";
import { formatLocalDate } from "@/lib/utils";

interface TicketHeaderProps {
  activeEvent: Event | null;
  totalTickets: number;
}

export default function TicketHeader({
  activeEvent,
  totalTickets,
}: TicketHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      <div>
        <Link
          href={`/dashboard?event_id=${activeEvent?.id || ""}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#acb9ca]/70 hover:text-[#66b2ff] transition-colors"
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
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#4e4e52]/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Planilla de Tickets
          </h1>
          <p className="text-xs text-[#acb9ca]/60 mt-1">
            Festival activo: <span className="font-bold text-[#66b2ff]">{activeEvent?.name || "Cargando..."}</span> • {activeEvent ? formatLocalDate(activeEvent.date) : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs font-semibold bg-[#66b2ff]/5 border border-[#66b2ff]/20 px-3 py-1.5 rounded-lg text-[#66b2ff]">
            Total: {totalTickets} tickets
          </div>
          <Link
            href={`/dashboard/tickets/new?event_id=${activeEvent?.id || ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/20 hover:text-white hover:border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-emerald-500/5 cursor-pointer"
          >
            <span>➕ Crear Ticket</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
