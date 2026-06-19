"use client";

import { TransferAuth } from "@/types";

interface TransferListProps {
  transfers: TransferAuth[];
  onUpdateState: (transferId: string | number, state: "APPROVED" | "REJECTED") => Promise<void>;
  transitioningId: string | number | null;
}

export default function TransferList({
  transfers,
  onUpdateState,
  transitioningId,
}: TransferListProps) {
  const getTransferStateBadge = (state: string | null) => {
    switch (state) {
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider animate-pulse">
            En Revisión
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 uppercase tracking-wider">
            Aprobado
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
            {state || "Desconocido"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-lg font-bold text-white uppercase tracking-wider border-b border-[#4e4e52]/10 pb-3">
        Comprobantes Adjuntos ({transfers.length})
      </h2>

      {transfers.length === 0 ? (
        <p className="text-sm text-[#acb9ca]/40 italic py-4">
          No hay comprobantes asociados a esta compra.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {transfers.map((t) => {
            const isApproved = t.state === "APPROVED";
            const isRejected = t.state === "REJECTED";
            const isSaving = transitioningId?.toString() === t.id.toString();

            return (
              <div
                key={t.id.toString()}
                className="flex flex-col rounded-3xl border border-[#4e4e52]/20 bg-[#0c0c0e]/30 overflow-hidden shadow-xl"
              >
                {/* Header of Transfer card */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-[#4e4e52]/10 bg-zinc-950/20">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Comprobante #{t.id.toString()}
                  </span>
                  {getTransferStateBadge(t.state)}
                </div>

                {/* Voucher Visual Rendering */}
                <div className="p-5 flex-1 flex flex-col justify-center items-center bg-[#080808]/40 border-b border-[#4e4e52]/10 min-h-[320px]">
                  {t.storage_path ? (
                    <div className="relative group w-full max-w-[280px] rounded-2xl overflow-hidden border border-zinc-700/30 shadow-2xl bg-zinc-950 flex flex-col items-center p-2">
                      <img
                        src={t.storage_path}
                        alt="Comprobante de Transferencia"
                        className="w-full h-auto object-contain max-h-[300px] rounded-xl transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      {/* Visual Stamp Overlay for status on receipt */}
                      {isApproved && (
                        <div className="absolute right-3 top-3 transform rotate-12 border-2 border-emerald-500 text-emerald-450 bg-[#080808]/90 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow">
                          Aprobado
                        </div>
                      )}
                      {isRejected && (
                        <div className="absolute right-3 top-3 transform rotate-12 border-2 border-rose-500 text-rose-450 bg-[#080808]/90 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded shadow">
                          Rechazado
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full max-w-[320px] rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md shadow-2xl p-6 flex flex-col gap-4 text-center items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 text-xl font-bold">
                        ⚠️
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Imagen no disponible
                        </h4>
                        <p className="text-[11px] text-[#acb9ca]/70 leading-relaxed">
                          No se pudo guardar la imagen de la transferencia (error de descarga/almacenamiento). Por favor, verifica el comprobante directamente en el chat de WhatsApp de este cliente.
                        </p>
                      </div>
                      {t.phone_number && (
                        <div className="text-xs bg-[#0c0c0e]/50 border border-[#4e4e52]/30 px-3 py-1.5 rounded-xl font-mono text-white select-all">
                          Teléfono: +{t.phone_number}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Validation Actions Panel */}
                <div className="p-4 flex gap-3 bg-zinc-950/20">
                  <button
                    onClick={() => onUpdateState(t.id, "APPROVED")}
                    disabled={isSaving}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isApproved
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                        : "border border-emerald-500/20 bg-emerald-500/5 text-emerald-450 hover:bg-emerald-500/10"
                    }`}
                  >
                    {isSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Aprobar
                  </button>

                  <button
                    onClick={() => onUpdateState(t.id, "REJECTED")}
                    disabled={isSaving}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isRejected
                        ? "bg-rose-600 text-white shadow-md shadow-rose-950/20"
                        : "border border-rose-500/20 bg-rose-500/5 text-rose-450 hover:bg-rose-500/10"
                    }`}
                  >
                    {isSaving ? (
                      <span className="w-3.5 h-3.5 border-2 border-rose-400/20 border-t-rose-400 rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    Rechazar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
