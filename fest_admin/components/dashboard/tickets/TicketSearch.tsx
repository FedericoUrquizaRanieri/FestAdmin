"use client";

interface TicketSearchProps {
  search: string;
  setSearch: (val: string) => void;
}

export default function TicketSearch({ search, setSearch }: TicketSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o apellido..."
          className="w-full h-11 pl-10 pr-10 text-sm rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-white placeholder-[#acb9ca]/40 focus:outline-none focus:border-[#66b2ff]/40 transition-colors"
        />
        <div className="absolute left-3.5 top-3.5 text-[#acb9ca]/40">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
          </svg>
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-3 text-[#acb9ca]/50 hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
