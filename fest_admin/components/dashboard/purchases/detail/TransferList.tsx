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
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  // Mock Receipt Data Generator based on transfer details
  const getMockReceiptInfo = (t: TransferAuth) => {
    const idNum = Number(t.id);
    const mockRef = `REF-MP-${1002938 + idNum * 27}-${idNum}`;
    const mockDate = new Date(t.created_at).toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    
    // Deterministic mock values based on ID
    const mockBanks = ["Mercado Pago", "Banco Galicia", "Ualá", "Santander Río"];
    const mockBank = mockBanks[idNum % mockBanks.length];
    
    const mockSenders = ["Felipe Urquiza", "Mariano Gómez", "Sofía Belgrano", "Lucía Ranieri"];
    const mockSender = mockSenders[idNum % mockSenders.length];
    
    return {
      reference: mockRef,
      dateString: mockDate,
      bankName: mockBank,
      senderName: mockSender,
    };
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
            const mockInfo = getMockReceiptInfo(t);
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

                {/* Voucher Mock Visual Rendering */}
                <div className="p-5 flex-1 flex flex-col justify-center items-center bg-[#080808]/40 border-b border-[#4e4e52]/10">
                  <div className="w-full max-w-[280px] rounded-2xl border border-zinc-700/30 bg-[#080808]/80 backdrop-blur-md shadow-2xl p-5 font-mono text-[10px] text-[#acb9ca]/90 relative overflow-hidden flex flex-col gap-3">
                    {/* Bank Header Ribbon */}
                    <div className="flex justify-between items-center border-b border-dashed border-zinc-700/50 pb-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-555 animate-pulse" />
                        <span className="font-extrabold text-white text-[9px] uppercase tracking-wider">
                          {mockInfo.bankName}
                        </span>
                      </div>
                      <span className="text-[8px] text-zinc-500">Comprobante Digital</span>
                    </div>

                    {/* Transfer Details */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-zinc-500 block uppercase">Operación Exitosa</span>
                      <span className="text-xs font-bold text-white">Transferencia Enviada</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] text-zinc-500 block uppercase">Remitente</span>
                      <span className="font-semibold text-white">{mockInfo.senderName}</span>
                      {t.phone_number && <span className="text-[8px] text-zinc-400">{t.phone_number}</span>}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] text-zinc-500 block uppercase">Referencia</span>
                      <span className="text-[8px] text-white font-medium select-all">{mockInfo.reference}</span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7px] text-zinc-500 block uppercase">Fecha de Transferencia</span>
                      <span className="text-[8px] text-white font-medium">{mockInfo.dateString}</span>
                    </div>

                    <div className="border-t border-dashed border-zinc-700/50 pt-2 flex justify-between items-baseline mt-2">
                      <span className="text-[8px] text-zinc-500 uppercase font-bold">Total Transferido</span>
                      <span className="text-base font-black text-emerald-450 select-all">
                        {formatCurrency(15000)}
                      </span>
                    </div>

                    {/* Visual Stamp Overlay for status on receipt */}
                    {isApproved && (
                      <div className="absolute right-3 top-8 transform rotate-12 border-2 border-emerald-500/40 text-emerald-400 bg-emerald-500/5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                        Aprobado
                      </div>
                    )}
                    {isRejected && (
                      <div className="absolute right-3 top-8 transform rotate-12 border-2 border-rose-500/40 text-rose-400 bg-rose-500/5 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                        Rechazado
                      </div>
                    )}
                  </div>
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
