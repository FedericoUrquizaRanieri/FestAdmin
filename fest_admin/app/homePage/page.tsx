"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import SkeletonCard from "@/components/SkeletonCard";
import CreateEventForm from "@/components/CreateEventForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import { Event } from "@/types";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit event state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketPriceInput, setTicketPriceInput] = useState("");
  const [transferLinkInput, setTransferLinkInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor inicia sesión de nuevo.");
        }
        throw new Error("Ocurrió un error al cargar los eventos.");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError((err as Error).message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch events on mount when authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      Promise.resolve().then(() => fetchEvents());
    }
  }, [isLoaded, isSignedIn]);

  const handleEventCreated = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setTicketPriceInput(
      event.ticket_price !== undefined && event.ticket_price !== null
        ? String(event.ticket_price)
        : ""
    );
    setTransferLinkInput(event.transfer_link || "");
    setUpdateError(null);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticket_price: ticketPriceInput ? Number(ticketPriceInput) : null,
          transfer_link: transferLinkInput || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "No se pudo actualizar el evento.");
      }

      // Close modal and refresh events
      setSelectedEvent(null);
      await fetchEvents();
    } catch (err) {
      setUpdateError((err as Error).message || "Error al actualizar el evento.");
    } finally {
      setUpdating(false);
    }
  };

  // 1. Loading state (Clerk loading)
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // 2. Protected route check fallback (Clerk middleware handles this, but client-side guard is safe)
  if (!isSignedIn) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-80px)] bg-[#080808] px-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Acceso Restringido</h3>
        <p className="text-sm text-[#acb9ca]/70 max-w-sm">
          Debes iniciar sesión para poder ver tus eventos y acceder al selector.
        </p>
      </div>
    );
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-12 md:px-12 md:py-16 max-w-7xl mx-auto w-full bg-[#080808]">
      {/* Greeting Area */}
      <div className="flex flex-col justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold text-[#66b2ff] uppercase tracking-widest">
            Panel del Administrador
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-1">
            Hola, {user.firstName || "Administrador"} 👋
          </h1>
          <p className="text-sm md:text-base text-[#acb9ca]/70 mt-2">
            Selecciona el festival que deseas gestionar para acceder a las estadísticas, chats y acreditaciones.
          </p>
        </div>

        {/* Collapsible Custom Event Form Button & Form */}
        <CreateEventForm onEventCreated={handleEventCreated} />
      </div>

      {/* Main Events Grid Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="No tienes eventos creados"
          description="Parece que tu base de datos está vacía. Utiliza el formulario superior para registrar tu primer festival y comenzar a gestionarlo."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in mt-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onEdit={handleOpenEditModal} />
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#4e4e52]/30 bg-[#0c0c0e]/95 p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-[#4e4e52]/20 pb-3">
              <h3 className="text-lg font-bold text-white">
                Editar Configuración
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-[#acb9ca]/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-sm text-[#acb9ca]/80 mb-2">
              <span className="font-semibold text-white">Evento:</span> {selectedEvent.name}
            </div>

            {updateError && (
              <div className="p-3 text-xs rounded-lg border border-red-500/20 bg-red-950/20 text-red-400">
                {updateError}
              </div>
            )}

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#acb9ca]/80">
                  Precio de Entrada ($)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 10000"
                  value={ticketPriceInput}
                  onChange={(e) => setTicketPriceInput(e.target.value)}
                  className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                  disabled={updating}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#acb9ca]/80">
                  Alias de Transferencia
                </label>
                <input
                  type="text"
                  placeholder="Ej: reptil.yuyo.medano"
                  value={transferLinkInput}
                  onChange={(e) => setTransferLinkInput(e.target.value)}
                  className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                  disabled={updating}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#4e4e52]/40 text-[#acb9ca] hover:bg-[#4e4e52]/10 hover:text-white transition-all text-sm font-semibold cursor-pointer"
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 flex items-center justify-center bg-gradient-to-r from-[#66b2ff] to-[#84d2ff] text-black font-bold text-sm py-2.5 rounded-lg hover:shadow-[0_0_15px_rgba(102,178,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {updating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
