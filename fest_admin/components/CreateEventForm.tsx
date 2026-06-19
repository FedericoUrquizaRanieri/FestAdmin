"use client";

import { useState } from "react";
import { Event } from "@/types";

interface CreateEventFormProps {
  onEventCreated: (newEvent: Event) => void;
}

export default function CreateEventForm({ onEventCreated }: CreateEventFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [ticketPrice, setTicketPrice] = useState("10000");
  const [transferLink, setTransferLink] = useState("reptil.yuyo.medano");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!eventName.trim()) {
      setFormError("El nombre del evento es requerido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: eventName,
          location: eventLocation,
          date: eventDate ? new Date(eventDate).toISOString() : null,
          ticket_price: ticketPrice ? Number(ticketPrice) : 10000,
          transfer_link: transferLink || "reptil.yuyo.medano",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el evento. Por favor reintenta.");
      }

      const newEvent = await response.json();
      onEventCreated(newEvent);

      // Reset form
      setEventName("");
      setEventLocation("");
      setEventDate("");
      setTicketPrice("10000");
      setTransferLink("reptil.yuyo.medano");
      setShowForm(false);
    } catch (err) {
      setFormError((err as Error).message || "Error al guardar el evento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mt-4 animate-fade-in">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full flex items-center justify-between gap-2 text-sm font-semibold bg-[#66b2ff]/10 text-[#66b2ff] hover:bg-[#66b2ff]/20 border border-[#66b2ff]/30 rounded-xl py-4 px-6 transition-all duration-200 cursor-pointer shadow-md shadow-[#66b2ff]/5"
      >
        <span className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${showForm ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {showForm ? "Cerrar Registro de Evento" : "Crear Nuevo Evento"}
        </span>
        <svg
          className={`w-4 h-4 text-[#66b2ff]/60 transition-transform duration-200 ${showForm ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Form Area */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showForm ? "max-h-[500px] mt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-[#4e4e52]/30 bg-[#0c0c0e]/80 backdrop-blur-md space-y-4 shadow-xl"
        >
          <h3 className="text-base font-bold text-white border-b border-[#4e4e52]/20 pb-2">
            Nuevo Festival o Evento
          </h3>

          {formError && (
            <div className="p-3 text-xs rounded-lg border border-red-500/20 bg-red-950/20 text-red-400">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#acb9ca]/80">
              Nombre del Evento
            </label>
            <input
              type="text"
              placeholder="Ej: Festival de Verano 2026"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#acb9ca]/80">
                Ubicación
              </label>
              <input
                type="text"
                placeholder="Ej: Complejo Ferial"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#acb9ca]/80">
                Fecha del Evento
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none [color-scheme:dark]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#acb9ca]/80">
                Precio de Entrada ($)
              </label>
              <input
                type="number"
                placeholder="Ej: 10000"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#acb9ca]/80">
                Alias de Transferencia
              </label>
              <input
                type="text"
                placeholder="Ej: reptil.yuyo.medano"
                value={transferLink}
                onChange={(e) => setTransferLink(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-lg bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/40 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center bg-gradient-to-r from-[#66b2ff] to-[#84d2ff] text-black font-bold text-sm h-11 rounded-lg hover:shadow-[0_0_15px_rgba(102,178,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                Registrando...
              </>
            ) : (
              "Guardar Evento"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
