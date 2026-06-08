"use client";

import { useState } from "react";
import { useDashboard } from "../../layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ErrorMessage from "@/components/ErrorMessage";

export default function NewExpensePage() {
  const { activeEvent } = useDashboard();
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!activeEvent) {
      setFormError("No hay un evento activo seleccionado.");
      return;
    }

    if (!description.trim()) {
      setFormError("La descripción del gasto es requerida.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("El monto debe ser un número mayor a cero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/expenses/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: Math.round(parsedAmount),
          event_id: activeEvent.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al registrar el gasto.");
      }

      // Success: Redirect back to the expenses list
      router.push(`/dashboard/expenses?event_id=${activeEvent.id}`);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || "Error al conectar con el servidor.");
      setIsSubmitting(false);
    }
  };

  if (!activeEvent) {
    return (
      <div className="py-20 flex justify-center bg-[#080808] min-h-screen">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-2xl mx-auto w-full bg-[#080808] animate-fade-in">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href={`/dashboard/expenses?event_id=${activeEvent.id}`}
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
          Volver a la Lista
        </Link>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Registrar Nuevo Gasto
        </h1>
        <p className="text-sm text-[#acb9ca]/70 mt-1">
          Carga un nuevo egreso para el festival <span className="text-[#66b2ff] font-medium">{activeEvent.name}</span>
        </p>
      </div>

      {formError && (
        <div className="mb-6">
          <ErrorMessage message={formError} />
        </div>
      )}

      {/* Glassmorphic Form Card */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl border border-[#4e4e52]/20 bg-[#0c0c0e]/40 backdrop-blur-sm shadow-2xl space-y-6"
      >
        {/* Description Input */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-xs font-bold text-[#acb9ca]/85 uppercase tracking-wider">
            Detalle / Descripción
          </label>
          <input
            id="description"
            type="text"
            placeholder="Ej: Pago de DJ, Compra de bebidas, Alquiler de sonido..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="w-full h-12 px-4 text-sm rounded-xl bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
            required
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-xs font-bold text-[#acb9ca]/85 uppercase tracking-wider">
            Monto (ARS)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#acb9ca]/55">
              $
            </span>
            <input
              id="amount"
              type="number"
              min="1"
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-12 pl-8 pr-4 text-sm rounded-xl bg-[#080808] border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all outline-none"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#4e4e52]/10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm h-12 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando Gasto...
              </>
            ) : (
              "Confirmar y Guardar"
            )}
          </button>
          
          <Link
            href={`/dashboard/expenses?event_id=${activeEvent.id}`}
            className="w-full sm:w-auto text-center font-bold text-sm text-[#acb9ca]/70 hover:text-white px-6 py-3 rounded-xl transition-colors border border-transparent hover:border-[#4e4e52]/20 hover:bg-[#0c0c0e]/30 cursor-pointer"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}