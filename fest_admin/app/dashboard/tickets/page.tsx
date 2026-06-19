"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDashboard } from "../layout";
import { Ticket } from "@/types";
import PageHeader from "@/components/dashboard/PageHeader";
import TicketSearch from "@/components/dashboard/tickets/TicketSearch";
import TicketTable from "@/components/dashboard/tickets/TicketTable";
import { formatLocalDate } from "@/lib/utils";

export default function TicketsPage() {
  const { activeEvent } = useDashboard();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 50;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset page to 0 on new search query
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchTickets = async (eventId: string, currentPage: number, searchVal: string) => {
    setLoadingTickets(true);
    setError(null);
    try {
      const skip = currentPage * limit;
      const response = await fetch(
        `/api/tickets?event_id=${eventId}&limit=${limit}&skip=${skip}&search=${encodeURIComponent(searchVal)}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener los tickets del evento.");
      }
      const data = await response.json();
      setTickets(data.tickets);
      setTotalTickets(data.total);
    } catch (err) {
      setError((err as Error).message || "Error al conectar con el servidor.");
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch tickets whenever active event, page, or search query changes
  useEffect(() => {
    if (activeEvent) {
      Promise.resolve().then(() => fetchTickets(activeEvent.id, page, debouncedSearch));
    }
  }, [activeEvent, page, debouncedSearch]);

  const totalPages = Math.ceil(totalTickets / limit);

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Planilla de Tickets"
        backHref={`/dashboard?event_id=${activeEvent?.id || ""}`}
        backLabel="Volver al Dashboard"
        subtitle={
          <>
            Festival activo: <span className="font-bold text-[#66b2ff]">{activeEvent?.name || "Cargando..."}</span>
            {activeEvent && ` • ${formatLocalDate(activeEvent.date)}`}
          </>
        }
        actions={
          <>
            <div className="text-xs font-semibold bg-[#66b2ff]/5 border border-[#66b2ff]/20 px-3 py-1.5 rounded-lg text-[#66b2ff]">
              Total: {totalTickets} tickets
            </div>
            <Link
              href={`/dashboard/tickets/new?event_id=${activeEvent?.id || ""}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 hover:bg-emerald-500/20 hover:text-white hover:border-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-emerald-500/5 cursor-pointer"
            >
              <span>➕ Crear Ticket</span>
            </Link>
          </>
        }
      />

      <TicketSearch search={search} setSearch={setSearch} />

      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onRetry={() => activeEvent && fetchTickets(activeEvent.id, page, debouncedSearch)}
          />
        </div>
      )}

      {loadingTickets && tickets.length === 0 ? (
        <LoadingSpinner variant="section" />
      ) : (
        <TicketTable
          tickets={tickets}
          loadingTickets={loadingTickets}
          page={page}
          setPage={setPage}
          totalTickets={totalTickets}
          limit={limit}
          totalPages={totalPages}
          search={search}
          onTicketUpdate={(updatedTicket) => {
            setTickets((prev) =>
              prev.map((t) =>
                t.id.toString() === updatedTicket.id.toString() ? updatedTicket : t
              )
            );
          }}
        />
      )}
    </main>
  );
}