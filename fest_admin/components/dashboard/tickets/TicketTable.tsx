"use client";

import EmptyState from "@/components/EmptyState";
import { Ticket } from "@/types";
import PaginationControls from "@/components/dashboard/PaginationControls";

interface TicketTableProps {
  tickets: Ticket[];
  loadingTickets: boolean;
  page: number;
  setPage: (updater: number) => void;
  totalTickets: number;
  limit: number;
  totalPages: number;
  search: string;
  onRetry?: () => void;
}

export default function TicketTable({
  tickets,
  loadingTickets,
  page,
  setPage,
  totalTickets,
  limit,
  totalPages,
  search,
}: TicketTableProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "$0";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon="🎫"
        title="No se encontraron tickets"
        description={
          search
            ? "No hay resultados para el término ingresado. Probá buscando de otra forma."
            : "Aún no se han registrado tickets para este festival."
        }
      />
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#4e4e52]/20 bg-zinc-950/40 text-[11px] font-bold text-[#acb9ca]/60 uppercase tracking-wider">
              <th className="py-4 px-6">Nombre del Adquirente</th>
              <th className="py-4 px-6">Género</th>
              <th className="py-4 px-6 text-right">Precio</th>
              <th className="py-4 px-6 text-center">Estado de Pago</th>
              <th className="py-4 px-6 text-center">Acreditación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#4e4e52]/10 text-sm text-[#acb9ca]/85">
            {tickets.map((t) => {
              const isPaid = t.payment_state === true;
              const isCheckedIn = !!t.checked_in;

              return (
                <tr
                  key={t.id.toString()}
                  className={`transition-colors duration-150 ${
                    isPaid
                      ? "hover:bg-zinc-950/20"
                      : "bg-red-500/[0.03] hover:bg-red-500/[0.06] text-red-100"
                  }`}
                >
                  {/* Name & Association Number */}
                  <td className="py-4 px-6 font-semibold">
                    <div className="flex flex-col">
                      <span className={`${isPaid ? "text-white" : "text-red-200"}`}>
                        {t.first_name || ""} {t.last_name || "Sin nombre"}
                      </span>
                      {t.number_assoc && (
                        <span className="text-[10px] text-[#acb9ca]/45 mt-0.5">
                          N° Asoc: {t.number_assoc}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Gender Badge */}
                  <td className="py-4 px-6">
                    {t.gender === "MALE" ? (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-[#66b2ff]/10 text-[#66b2ff] border border-[#66b2ff]/20 uppercase tracking-wide">
                        Hombre
                      </span>
                    ) : t.gender === "FEMALE" ? (
                      <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-wide">
                        Mujer
                      </span>
                    ) : (
                      <span className="text-xs text-[#acb9ca]/40">-</span>
                    )}
                  </td>

                  {/* Ticket Price */}
                  <td className="py-4 px-6 text-right font-mono font-semibold">
                    {formatCurrency(t.price)}
                  </td>

                  {/* Payment State badge */}
                  <td className="py-4 px-6 text-center">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                        ● Abonado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-wider animate-pulse">
                        ● Pendiente
                      </span>
                    )}
                  </td>

                  {/* Checked-in entry stamp */}
                  <td className="py-4 px-6 text-center">
                    {isCheckedIn ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium"
                        title={`Ingreso registrado el ${new Date(t.checked_in!).toLocaleString()}`}
                      >
                        <svg
                          className="w-4 h-4 text-emerald-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {formatTime(t.checked_in)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#acb9ca]/30">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        totalItems={totalTickets}
        limit={limit}
        itemsName="entradas"
        loading={loadingTickets}
        hoverColor="blue"
        containerVariant="table-footer"
      />
    </div>
  );
}
