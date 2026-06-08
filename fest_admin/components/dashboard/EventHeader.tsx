"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Event } from "@/types";
import { formatLocalDate } from "@/lib/utils";

interface EventHeaderProps {
  events: Event[];
  activeEvent: Event | null;
  handleSelectEvent: (event: Event) => void;
}

export default function EventHeader({
  events,
  activeEvent,
  handleSelectEvent,
}: EventHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSelect = (e: Event) => {
    setDropdownOpen(false);
    handleSelectEvent(e);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div>
        <Link
          href="/homePage"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#acb9ca]/70 hover:text-[#66b2ff] transition-colors mb-3"
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#4e4e52]/10">
        {/* Active Event Dropdown Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="group flex items-center gap-2 text-2xl md:text-3xl font-extrabold text-white hover:text-[#66b2ff] transition-colors focus:outline-none cursor-pointer"
          >
            <span>{activeEvent?.name || "Cargando evento..."}</span>
            <svg
              className={`w-6 h-6 text-[#acb9ca] group-hover:text-[#66b2ff] transition-transform duration-300 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 max-h-80 overflow-y-auto rounded-xl border border-[#4e4e52]/30 bg-[#0c0c0e] shadow-2xl z-50 animate-fade-in py-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#acb9ca]/50 tracking-wider">
                Cambiar de Evento
              </div>
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onSelect(e)}
                  className={`w-full text-left px-4 py-3 text-sm flex flex-col gap-0.5 hover:bg-[#66b2ff]/10 transition-colors cursor-pointer border-l-2 ${
                    e.id === activeEvent?.id
                      ? "border-[#66b2ff] bg-[#66b2ff]/5 text-white"
                      : "border-transparent text-[#acb9ca]/90 hover:text-white"
                  }`}
                >
                  <span className="font-semibold">{e.name}</span>
                  <span className="text-[11px] text-[#acb9ca]/50">
                    {formatLocalDate(e.date)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Event Meta Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-[#acb9ca]/75">
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-[#66b2ff]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {activeEvent ? formatLocalDate(activeEvent.date) : ""}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 hidden sm:inline" />
            <span className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-[#66b2ff]"
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
              {activeEvent?.location || "Sin ubicación configurada"}
            </span>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href={`/dashboard/tickets?event_id=${activeEvent?.id || ""}`}
            className="text-sm font-bold px-6 py-3.5 border-2 rounded-full bg-[#66b2ff]/10 hover:bg-[#66b2ff]/20 text-[#66b2ff] hover:text-white border-[#66b2ff]/30 hover:border-[#66b2ff] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-[#66b2ff]/5 cursor-pointer"
          >
            🎟️ Tabla de Tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
