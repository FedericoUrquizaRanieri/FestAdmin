"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorMessage from "@/components/ErrorMessage";
import { useDashboard } from "./layout";
import { DashboardData } from "@/types";
import EventHeader from "@/components/dashboard/EventHeader";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import OperationsSummary from "@/components/dashboard/OperationsSummary";
import AudienceSummary from "@/components/dashboard/AudienceSummary";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const { events, activeEvent } = useDashboard();
  
  const [metrics, setMetrics] = useState<DashboardData | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics whenever activeEvent changes
  useEffect(() => {
    if (activeEvent) {
      fetchDashboardMetrics(activeEvent.id);
    }
  }, [activeEvent]);

  const fetchDashboardMetrics = async (eventId: string) => {
    setLoadingMetrics(true);
    setError(null);
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
    }
  };

  const handleSelectEvent = (event: any) => {
    router.push(`/dashboard?event_id=${event.id}`);
  };

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <EventHeader
        events={events}
        activeEvent={activeEvent}
        handleSelectEvent={handleSelectEvent}
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onRetry={() => activeEvent && fetchDashboardMetrics(activeEvent.id)}
          />
        </div>
      )}

      {loadingMetrics && !metrics ? (
        <LoadingSpinner variant="section" />
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

