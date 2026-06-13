"use client";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  setPage: (newPage: number) => void;
  totalItems: number;
  limit: number;
  itemsName: string; // e.g. "entradas", "compras", "conversaciones", "gastos"
  loading?: boolean;
  hoverColor?: "blue" | "rose";
  containerVariant?: "card" | "table-footer";
}

export default function PaginationControls({
  page,
  totalPages,
  setPage,
  totalItems,
  limit,
  itemsName,
  loading = false,
  hoverColor = "blue",
  containerVariant = "table-footer",
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalItems);

  const containerClasses =
    containerVariant === "card"
      ? "flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl border border-[#4e4e52]/10 bg-[#0c0c0e]/20 backdrop-blur-sm shadow-xl"
      : "flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#4e4e52]/10 bg-[#0c0c0e]/40";

  const hoverBorderClass =
    hoverColor === "rose" ? "hover:border-rose-500/40" : "hover:border-[#66b2ff]/40";

  return (
    <div className={containerClasses}>
      <div className="text-xs text-[#acb9ca]/60">
        Mostrando <span className="font-semibold text-white">{startItem}</span> a{" "}
        <span className="font-semibold text-white">{endItem}</span> de{" "}
        <span className="font-semibold text-white">{totalItems}</span> {itemsName}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setPage(Math.max(page - 1, 0))}
          disabled={page === 0 || loading}
          className={`h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center ${hoverBorderClass}`}
        >
          Anterior
        </button>
        <div className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
          Página {page + 1} de {totalPages}
        </div>
        <button
          onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
          disabled={page >= totalPages - 1 || loading}
          className={`h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center ${hoverBorderClass}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
