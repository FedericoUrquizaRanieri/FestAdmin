"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboard } from "../layout";
import { Expense } from "@/types";
import { formatLocalDate } from "@/lib/utils";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/dashboard/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import PaginationControls from "@/components/dashboard/PaginationControls";

export default function ExpensesPage() {
  const { activeEvent } = useDashboard();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const limit = 10;

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const handleDelete = async (expenseId: string | number) => {
    const confirmed = confirm("¿Estás seguro de que deseas eliminar este gasto?");
    if (!confirmed) return;

    setDeletingId(expenseId);
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el gasto.");
      }

      setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
    } catch (err: any) {
      alert(err.message || "Error al eliminar el gasto.");
    } finally {
      setDeletingId(null);
    }
  };

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
    return <LoadingSpinner variant="section" />;
  }

  // Paginated Slices
  const totalExpensesCount = expenses.length;
  const totalPages = Math.ceil(totalExpensesCount / limit);
  const paginatedExpenses = expenses.slice(page * limit, (page + 1) * limit);

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Planilla de Gastos"
        backHref={`/dashboard?event_id=${activeEvent.id}`}
        backLabel="Volver al Panel"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>Festival activo:</span>
            <span className="font-bold text-[#66b2ff]">{activeEvent.name}</span>
            {activeEvent.date && (
              <>
                <span className="text-[#acb9ca]/30">•</span>
                <span>{formatLocalDate(activeEvent.date)}</span>
              </>
            )}
          </span>
        }
        actions={
          <>
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
          </>
        }
      />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => fetchExpenses(activeEvent.id)} />
        </div>
      )}

      {loading && expenses.length === 0 ? (
        <LoadingSpinner variant="section" />
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
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#acb9ca]/60 text-center w-20">Acciones</th>
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
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={deletingId === expense.id}
                          className="p-1.5 text-[#acb9ca]/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center justify-center min-h-[32px] min-w-[32px]"
                          title="Eliminar gasto"
                        >
                          {deletingId === expense.id ? (
                            <svg className="animate-spin h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
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
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              totalItems={totalExpensesCount}
              limit={limit}
              itemsName="gastos"
              loading={loading}
              hoverColor="rose"
              containerVariant="table-footer"
            />
          </div>
        </div>
      )}
    </main>
  );
}