"use client";

import { createContext, useContext, useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import { Event } from "@/types";

interface DashboardContextType {
  events: Event[];
  activeEvent: Event | null;
  loadingEvents: boolean;
  errorEvents: string | null;
  refreshEvents: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

function DashboardProviderInner({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const urlEventId = searchParams.get("event_id");

  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setErrorEvents(null);
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
    } catch (err: any) {
      setErrorEvents(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch events list on mount
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchEvents();
    }
  }, [isLoaded, isSignedIn]);

  // Sync activeEvent when urlEventId or events change
  useEffect(() => {
    if (events.length === 0) return;

    const params = new URLSearchParams(searchParams.toString());

    if (urlEventId) {
      const matchedEvent = events.find((e) => e.id === urlEventId);
      if (matchedEvent) {
        setActiveEvent(matchedEvent);
      } else {
        // Fallback to first event and update URL
        setActiveEvent(events[0]);
        params.set("event_id", events[0].id);
        router.replace(`${pathname}?${params.toString()}`);
      }
    } else {
      // No ID in URL, fallback to first event and update URL
      setActiveEvent(events[0]);
      params.set("event_id", events[0].id);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [urlEventId, events, pathname, router, searchParams]);

  // Auth Guards in Layout
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

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

  // Error loading events on mount
  if (errorEvents && events.length === 0) {
    return (
      <div className="flex flex-col flex-1 px-6 py-12 max-w-7xl mx-auto w-full bg-[#080808]">
        <ErrorMessage message={errorEvents} onRetry={fetchEvents} />
      </div>
    );
  }

  // Initial loading events spinner
  if (loadingEvents) {
    return <LoadingSpinner />;
  }

  // Empty state if no events created yet
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
      </main>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        events,
        activeEvent,
        loadingEvents,
        errorEvents,
        refreshEvents: fetchEvents,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardProviderInner>{children}</DashboardProviderInner>
    </Suspense>
  );
}
