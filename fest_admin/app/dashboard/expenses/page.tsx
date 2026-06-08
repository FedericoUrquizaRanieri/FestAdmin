"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "../layout";
import { Expense } from "@/types";
import { formatLocalDate } from "@/lib/utils";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";

export default function ExpensesPage() {
  const { activeEvent } = useDashboard();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchExpenses = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/expenses?event_id=${eventId}`);
      if (!response.ok) {
        throw new Error("Error al obtener los gastos del evento.");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEvent) {
      fetchExpenses(activeEvent.id);
      setPage(0); // Reset page to 0 on active event switch
    }
  }, [activeEvent]);

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!activeEvent) {
    return (
      <div className="py-20 flex justify-center bg-[#080808] min-h-screen">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Paginated Slices
  const totalExpensesCount = expenses.length;
  const totalPages = Math.ceil(totalExpensesCount / limit);
  const paginatedExpenses = expenses.slice(page * limit, (page + 1) * limit);

  const startItem = totalExpensesCount === 0 ? 0 : page * limit + 1;
  const endItem = Math.min((page + 1) * limit, totalExpensesCount);

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      {/* Back Button */}
      <div className="mb-6">
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

      {/* Header Title and CTA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#4e4e52]/10 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Planilla de Gastos
          </h1>
          <p className="text-xs text-[#acb9ca]/60 mt-1.5 flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
            {activeEvent.date && (
              <>
                <span className="text-[#acb9ca]/30">•</span>
                <span>{formatLocalDate(activeEvent.date)}</span>
              </>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs font-bold bg-rose-500/5 border border-rose-500/20 px-4 py-2 rounded-xl text-rose-400 select-all">
            Total Gastos: {formatCurrency(totalAmount)}
          </div>
          
          <Link
            href={`/dashboard/expenses/new?event_id=${activeEvent.id}`}
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-rose-950/20 hover:-translate-y-0.5 hover:shadow-rose-500/20 border border-rose-500/20 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Registrar Gasto
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => fetchExpenses(activeEvent.id)} />
        </div>
      )}

      {loading && expenses.length === 0 ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="💸"
          title="No hay gastos registrados"
          description="Aún no se han cargado gastos para este evento. ¡Registra el primero presionando en Registrar Gasto!"
        />
      ) : (
        <div className="flex flex-col gap-6 animate-fade-in">
          {/* Table Container */}
          <div className="overflow-hidden rounded-2xl border border-[#4e4e52]/10 bg-[#0c0c0e]/20 backdrop-blur-sm shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#4e4e52]/20 bg-[#0c0c0e]/60">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#acb9ca]/60">Detalle / Descripción</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#acb9ca]/60">Fecha</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#acb9ca]/60 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4e4e52]/10">
                  {paginatedExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="group hover:bg-[#0c0c0e]/60 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-white group-hover:text-rose-300 transition-colors">
                        {expense.description || "Sin descripción"}
                      </td>
                      <td className="py-4 px-6 text-sm text-[#acb9ca]/70">
                        {formatLocalDate(expense.created_at)}
                      </td>
                      <td className="py-4 px-6 text-sm font-extrabold text-rose-400 text-right select-all">
                        {formatCurrency(expense.amount ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#4e4e52]/10 bg-[#0c0c0e]/40">
                <div className="text-xs text-[#acb9ca]/60">
                  Mostrando <span className="font-semibold text-white">{startItem}</span> a{" "}
                  <span className="font-semibold text-white">{endItem}</span> de{" "}
                  <span className="font-semibold text-white">{totalExpensesCount}</span> gastos
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0 || loading}
                    className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-rose-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                  >
                    Anterior
                  </button>
                  <div className="text-xs font-bold text-white bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700">
                    Página {page + 1} de {totalPages}
                  </div>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1 || loading}
                    className="h-9 px-4 rounded-xl border border-[#4e4e52]/20 bg-[#0c0c0e]/60 text-xs font-semibold text-[#acb9ca] hover:text-white hover:border-rose-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}