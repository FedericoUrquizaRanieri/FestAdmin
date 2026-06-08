"use client";

interface ConversationFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  controlFilter: string;
  setControlFilter: (val: string) => void;
}

export default function ConversationFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  controlFilter,
  setControlFilter,
}: ConversationFiltersProps) {
  return (
    <div className="p-4 rounded-2xl border border-[#4e4e52]/15 bg-[#0c0c0e]/30 flex flex-col md:flex-row gap-4 mb-6 shadow-md">
      {/* Search */}
      <div className="flex-1 relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#acb9ca]/40">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar por número de teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 text-sm rounded-xl bg-[#080808] border border-[#4e4e52]/30 text-white placeholder-[#acb9ca]/30 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
        />
      </div>

      {/* Filters Select */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-3 text-sm rounded-xl bg-[#080808] border border-[#4e4e52]/30 text-white focus:border-[#66b2ff] transition-all outline-none cursor-pointer [color-scheme:dark]"
        >
          <option value="ALL">Todos los Estados</option>
          <option value="IDLE">Inactivo (IDLE)</option>
          <option value="WAITING_PAYMENT">Esperando Pago</option>
          <option value="WAITING_CONFIRMATION">Confirmación Pendiente</option>
          <option value="COMPLETED">Completados</option>
        </select>

        <select
          value={controlFilter}
          onChange={(e) => setControlFilter(e.target.value)}
          className="h-11 px-3 text-sm rounded-xl bg-[#080808] border border-[#4e4e52]/30 text-white focus:border-[#66b2ff] transition-all outline-none cursor-pointer [color-scheme:dark]"
        >
          <option value="ALL">Todo Control</option>
          <option value="AI">Control IA</option>
          <option value="HUMAN">Control Humano</option>
        </select>
      </div>
    </div>
  );
}
