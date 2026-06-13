"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../layout";
import { Conversation } from "@/types";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import ConversationFilters from "@/components/dashboard/conversations/ConversationFilters";
import ConversationCard from "@/components/dashboard/conversations/ConversationCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginationControls from "@/components/dashboard/PaginationControls";

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
    return <LoadingSpinner variant="section" />;
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

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Conversaciones y Control"
        backHref={`/dashboard?event_id=${activeEvent.id}`}
        backLabel="Volver al Panel"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
          </span>
        }
        actions={
          <div className="text-xs font-semibold bg-[#66b2ff]/5 border border-[#66b2ff]/20 px-4 py-2 rounded-xl text-[#66b2ff]">
            Total: {filteredConversations.length} conversaciones
          </div>
        }
      />

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
        <LoadingSpinner variant="section" />
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

          <PaginationControls
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            totalItems={totalCount}
            limit={limit}
            itemsName="conversaciones"
            loading={loading}
            hoverColor="blue"
            containerVariant="card"
          />
        </div>
      )}
    </main>
  );
}