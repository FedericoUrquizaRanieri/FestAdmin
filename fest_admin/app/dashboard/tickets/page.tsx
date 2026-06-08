"use client";

import { useEffect, useState } from "react";
import ErrorMessage from "@/components/ErrorMessage";
import { useDashboard } from "../layout";
import { Ticket } from "@/types";
import TicketHeader from "@/components/dashboard/tickets/TicketHeader";
import TicketSearch from "@/components/dashboard/tickets/TicketSearch";
import TicketTable from "@/components/dashboard/tickets/TicketTable";

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

  // Fetch tickets whenever active event, page, or search query changes
  useEffect(() => {
    if (activeEvent) {
      fetchTickets(activeEvent.id, page, debouncedSearch);
    }
  }, [activeEvent, page, debouncedSearch]);

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
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingTickets(false);
    }
  };

  const totalPages = Math.ceil(totalTickets / limit);

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <TicketHeader activeEvent={activeEvent} totalTickets={totalTickets} />

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
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        </div>
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
        />
      )}
    </main>
  );
}