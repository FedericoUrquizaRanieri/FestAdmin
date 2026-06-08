"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { Conversation } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import ConversationHeader from "@/components/dashboard/conversations/ConversationHeader";
import ConversationFilters from "@/components/dashboard/conversations/ConversationFilters";
import ConversationCard from "@/components/dashboard/conversations/ConversationCard";

export default function ConversationsPage() {
  const { activeEvent } = useDashboard();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [controlFilter, setControlFilter] = useState("ALL");

  // Pagination State
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchConversations = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/conversations?event_id=${eventId}`);
      if (!response.ok) {
        throw new Error("Error al obtener las conversaciones del evento.");
      }
      const data = await response.json();
      setConversations(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEvent) {
      fetchConversations(activeEvent.id);
    }
  }, [activeEvent]);

  // Reset page to 0 on filter changes
  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, controlFilter, activeEvent]);

  const handleTransferToHuman = async (conversationId: string) => {
    setTransitioningId(conversationId);
    try {
      const response = await fetch("/api/conversations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          control_over: "HUMAN",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo transferir el control.");
      }

      // Update state locally
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, control_over: "HUMAN" } : c
        )
      );
    } catch (err: any) {
      alert(err.message || "Error al transferir el control.");
    } finally {
      setTransitioningId(null);
    }
  };

  if (!activeEvent) {
    return (
      <div className="py-20 flex justify-center bg-[#080808] min-h-screen">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtering Logic
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.phone_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.state === statusFilter;
    const matchesControl = controlFilter === "ALL" || c.control_over === controlFilter;
    return matchesSearch && matchesStatus && matchesControl;
  });

  // Pagination Slices
  const totalCount = filteredConversations.length;
  const totalPages = Math.ceil(totalCount / limit);
  const paginatedConversations = filteredConversations.slice(page * limit, (page + 1) * limit);

  const startItem = totalCount === 0 ? 0 : page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalCount);

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <ConversationHeader activeEvent={activeEvent} filteredCount={filteredConversations.length} />

      <ConversationFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        controlFilter={controlFilter}
        setControlFilter={setControlFilter}
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => fetchConversations(activeEvent.id)} />
        </div>
      )}

      {loading && conversations.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        </div>
      ) : filteredConversations.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No se encontraron conversaciones"
          description={
            search || statusFilter !== "ALL" || controlFilter !== "ALL"
              ? "No hay resultados para los filtros seleccionados. Probá modificando los criterios."
              : "Aún no hay conversaciones registradas para este festival."
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* List of cards */}
          <div className="grid grid-cols-1 gap-4">
            {paginatedConversations.map((c) => (
              <ConversationCard
                key={c.id}
                conversation={c}
                transitioningId={transitioningId}
                onTransferToHuman={handleTransferToHuman}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-[#4e4e52]/10 bg-[#0c0c0e]/20 backdrop-blur-sm shadow-xl">
              <div className="text-xs text-[#acb9ca]/60">
                Mostrando <span className="font-semibold text-white">{startItem}</span> a{" "}
                <span className="font-semibold text-white">{endItem}</span> de{" "}
                <span className="font-semibold text-white">{totalCount}</span> conversaciones
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0 || loading}
                  className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-[#66b2ff]/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  Anterior
                </button>
                <div className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                  Página {page + 1} de {totalPages}
                </div>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={page >= totalPages - 1 || loading}
                  className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-[#66b2ff]/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}