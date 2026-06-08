"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import { Event, DashboardData } from "@/types";
import EventHeader from "@/components/dashboard/EventHeader";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import OperationsSummary from "@/components/dashboard/OperationsSummary";
import AudienceSummary from "@/components/dashboard/AudienceSummary";

function DashboardContent() {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlEventId = searchParams.get("event_id");

  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: Fetch events list on mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEvents();
    }
  }, [isLoaded, isSignedIn]);

  // Phase 2: Fetch dashboard metrics concurrently when urlEventId is available
  useEffect(() => {
    if (isLoaded && isSignedIn && urlEventId) {
      fetchDashboardMetrics(urlEventId);
    }
  }, [isLoaded, isSignedIn, urlEventId]);

  // Phase 3: Match active event details once events are loaded
  useEffect(() => {
    if (events.length === 0) return;

    if (urlEventId) {
      const matchedEvent = events.find((e) => e.id === urlEventId);
      if (matchedEvent) {
        setActiveEvent(matchedEvent);
      } else {
        // ID in URL is invalid, fallback to first event and correct URL
        setActiveEvent(events[0]);
        router.replace(`/dashboard?event_id=${events[0].id}`);
      }
    } else {
      // No ID in URL, fallback to first event and update URL
      setActiveEvent(events[0]);
      router.replace(`/dashboard?event_id=${events[0].id}`);
    }
  }, [urlEventId, events, router]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor inicia sesión.");
        }
        throw new Error("Error al obtener la lista de eventos.");
      }
      const data = await response.json();
      setEvents(data);
      if (data.length === 0) {
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
      setLoading(false);
    }
  };

  const fetchDashboardMetrics = async (eventId: string) => {
    setLoadingMetrics(true);
    try {
      const response = await fetch(`/api/dashboard?event_id=${eventId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener las estadísticas del evento.");
      }
      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingMetrics(false);
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    router.push(`/dashboard?event_id=${event.id}`);
  };

  // 1. Loading auth state
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // 2. Auth restriction
  if (!isSignedIn) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-80px)] bg-[#080808] px-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Acceso Restringido</h3>
        <p className="text-sm text-[#acb9ca]/70 max-w-sm">
          Debes iniciar sesión para poder visualizar el panel de administración.
        </p>
      </div>
    );
  }

  // 3. Error state (if first loading failed)
  if (error && events.length === 0) {
    return (
      <div className="flex flex-col flex-1 px-6 py-12 max-w-7xl mx-auto w-full bg-[#080808]">
        <ErrorMessage message={error} onRetry={fetchEvents} />
      </div>
    );
  }

  // 4. Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // 5. Empty state (No events created yet)
  if (events.length === 0) {
    return (
      <main className="flex flex-col flex-1 px-6 py-12 md:px-12 md:py-16 max-w-7xl mx-auto w-full bg-[#080808]">
        <div className="mb-6">
          <Link
            href="/homePage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#acb9ca] hover:text-[#66b2ff] transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Mis Eventos
          </Link>
        </div>
        <EmptyState
          icon="📊"
          title="Sin eventos registrados"
          description="Para visualizar el panel de control, primero debes registrar al menos un festival en tu listado."
        />
        <div className="flex justify-center mt-6">
          <Link
            href="/homePage"
            className="bg-gradient-to-r from-[#66b2ff] to-[#84d2ff] text-black font-bold text-sm h-11 px-6 rounded-full hover:shadow-[0_0_15px_rgba(102,178,255,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center cursor-pointer"
          >
            Crear mi primer Evento
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <EventHeader
        events={events}
        activeEvent={activeEvent}
        handleSelectEvent={handleSelectEvent}
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => activeEvent && fetchDashboardMetrics(activeEvent.id)} />
        </div>
      )}

      {loadingMetrics && !metrics ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <FinanceSummary metrics={metrics} activeEventId={activeEvent?.id} />
          <OperationsSummary metrics={metrics} activeEventId={activeEvent?.id} />
          <AudienceSummary metrics={metrics} activeEventId={activeEvent?.id} />
        </div>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
