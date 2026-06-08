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

  // Fetch events on mount when authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEvents();
    }
  }, [isLoaded, isSignedIn]);

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
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvents((prev) => [newEvent, ...prev]);
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
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
