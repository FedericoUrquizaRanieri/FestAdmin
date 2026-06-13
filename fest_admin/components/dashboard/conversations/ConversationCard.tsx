"use client";

import { Conversation } from "@/types";

interface ConversationCardProps {
  conversation: Conversation;
  transitioningId: string | null;
  onTransferToHuman: (id: string) => Promise<void>;
}

export default function ConversationCard({
  conversation: c,
  transitioningId,
  onTransferToHuman,
}: ConversationCardProps) {
  const isHuman = c.control_over === "HUMAN";

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Sin actividad";
    const d = new Date(dateString);
    return `${d.toLocaleDateString("es-AR")} ${d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatusBadge = (state: string | null) => {
    switch (state) {
      case "IDLE":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-700/50 uppercase tracking-wide">
            Inactivo (IDLE)
          </span>
        );
      case "WAITING_PAYMENT":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-[#66b2ff] border border-sky-500/20 uppercase tracking-wide">
            Esperando Pago
          </span>
        );
      case "WAITING_CONFIRMATION":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide animate-pulse">
            Confirmación Pendiente
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
            Completado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 uppercase tracking-wide">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/30 p-5 md:p-6 transition-all duration-300 hover:border-[#4e4e52]/45 hover:bg-[#0c0c0e]/50 hover:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
      {/* Left Side: Phone, Badges, Summary */}
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-extrabold text-white group-hover:text-[#66b2ff] transition-colors select-all">
            {c.phone_number || "Desconocido"}
          </h3>
          {getStatusBadge(c.state)}
        </div>

        <p className="text-[11px] text-[#acb9ca]/45">
          Última actividad: <span className="font-semibold text-[#acb9ca]/70">{formatDateTime(c.last_message)}</span>
        </p>

        {c.summary ? (
          <div className="p-3.5 rounded-xl bg-[#080808]/50 border border-[#4e4e52]/10 text-xs text-[#acb9ca]/85 leading-relaxed font-medium">
            <span className="font-bold text-[#66b2ff] block mb-1 text-[10px] uppercase tracking-wider">
              Resumen del Chat (AI)
            </span>
            "{c.summary}"
          </div>
        ) : (
          <p className="text-xs text-[#acb9ca]/30 italic">Sin resumen disponible.</p>
        )}
      </div>

      {/* Right Side: Owner and Human Handover Trigger */}
      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#4e4e52]/10 md:min-w-[190px]">
        {/* Control Owner Badge */}
        <div className="flex flex-col md:items-end gap-1">
          <span className="text-[10px] text-[#acb9ca]/40 uppercase tracking-wider font-bold">
            Control
          </span>
          {isHuman ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 uppercase tracking-wider">
              ● Humano
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
              ● Inteligencia Artificial
            </span>
          )}
        </div>

        {/* Action Button */}
        {!isHuman && (
          <button
            onClick={() => onTransferToHuman(c.id)}
            disabled={transitioningId === c.id}
            className="inline-flex items-center gap-2 bg-[#66b2ff]/10 text-[#66b2ff] hover:bg-[#66b2ff]/20 border border-[#66b2ff]/30 px-4.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5 cursor-pointer shadow-md shadow-[#66b2ff]/5"
          >
            {transitioningId === c.id ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></span>
                Transfiriendo...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Tomar Control
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
