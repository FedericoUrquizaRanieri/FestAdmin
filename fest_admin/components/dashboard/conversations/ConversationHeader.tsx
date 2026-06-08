"use client";

import Link from "next/link";
import { Event } from "@/types";

interface ConversationHeaderProps {
  activeEvent: Event;
  filteredCount: number;
}

export default function ConversationHeader({
  activeEvent,
  filteredCount,
}: ConversationHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Back Button */}
      <div>
        <Link
          href={`/dashboard?event_id=${activeEvent.id}`}
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
          Volver al Panel
        </Link>
      </div>

      {/* Header and Subtitles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#4e4e52]/10 pb-5 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Conversaciones y Control
          </h1>
          <p className="text-xs text-[#acb9ca]/60 mt-1.5 flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
          </p>
        </div>
        <div className="text-xs font-semibold bg-[#66b2ff]/5 border border-[#66b2ff]/20 px-4 py-2 rounded-xl text-[#66b2ff]">
          Total: {filteredCount} conversaciones
        </div>
      </div>
    </div>
  );
}
