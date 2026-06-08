"use client";

import { useRouter } from "next/navigation";
import { Event } from "@/types";
import { formatLocalDate } from "@/lib/utils";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const formattedDate = formatLocalDate(event.date);

  const handleManage = () => {
    router.push(`/dashboard?event_id=${event.id}`);
  };

  return (
    <div
      onClick={handleManage}
      className="group relative flex flex-col justify-between h-48 p-6 rounded-2xl border border-[#4e4e52]/20 bg-[#080808]/40 hover:bg-[#0c0c0e] hover:border-[#66b2ff]/40 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(102,178,255,0.08)] cursor-pointer overflow-hidden"
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#66b2ff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-semibold text-[#66b2ff] bg-[#66b2ff]/10 px-2 py-0.5 rounded border border-[#66b2ff]/20 uppercase tracking-wider">
            Evento Activo
          </span>
          <span className="text-xs text-[#acb9ca]/60 font-medium">
            {formattedDate}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-[#66b2ff] line-clamp-2 transition-colors duration-200">
          {event.name || "Evento sin nombre"}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#4e4e52]/10">
        <div className="flex items-center gap-1.5 text-xs text-[#acb9ca]/80 truncate max-w-[70%]">
          <svg
            className="w-3.5 h-3.5 text-[#66b2ff] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{event.location || "Sin ubicación"}</span>
        </div>

        <span className="flex items-center gap-1 text-xs font-bold text-[#66b2ff] group-hover:translate-x-0.5 transition-transform duration-200">
          Gestionar
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
