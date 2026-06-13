"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDashboard } from "@/app/dashboard/layout";
import PageHeader from "@/components/dashboard/PageHeader";

export default function NewTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeEvent } = useDashboard();
  
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [numberAssoc, setNumberAssoc] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "">("");
  const [price, setPrice] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const eventId = searchParams.get("event_id") || activeEvent?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("El nombre y apellido son requeridos.");
      return;
    }

    if (!gender) {
      setError("Por favor selecciona un género.");
      return;
    }

    if (!price.trim() || isNaN(Number(price)) || Number(price) < 0) {
      setError("Por favor ingresa un precio válido.");
      return;
    }

    if (!eventId) {
      setError("No hay un festival activo seleccionado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          number_assoc: numberAssoc.trim(),
          gender,
          price: parseFloat(price),
          event_id: eventId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error al crear el ticket.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/tickets?event_id=${eventId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col flex-1 px-6 py-8 md:px-12 md:py-10 max-w-2xl mx-auto w-full bg-[#080808] animate-fade-in">
      <PageHeader
        title="Crear Nuevo Ticket"
        backHref={`/dashboard/tickets?event_id=${eventId || ""}`}
        backLabel="Volver a la Planilla de Tickets"
        subtitle={
          <>
            Se registrará una entrada abonada y su respectiva compra vinculada al festival{" "}
            <span className="font-bold text-[#66b2ff]">{activeEvent?.name || "Cargando..."}</span>.
          </>
        }
      />


      {success ? (
        <div className="p-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 text-center space-y-3 animate-fade-in">
          <div className="text-4xl">🎉</div>
          <h3 className="text-lg font-bold text-white">¡Ticket creado con éxito!</h3>
          <p className="text-xs text-[#acb9ca]/70">
            Redireccionando a la planilla de tickets...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-xs rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 animate-fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#acb9ca]/85">
                Nombre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-xl bg-[#0c0c0e]/80 border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#acb9ca]/85">
                Apellido <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-11 px-4 text-sm rounded-xl bg-[#0c0c0e]/80 border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#acb9ca]/85">
              Número de Asociación / Teléfono
            </label>
            <input
              type="text"
              placeholder="Ej: +54 9 291 1234567 o Nro Asoc"
              value={numberAssoc}
              onChange={(e) => setGenderOrNumber(e.target.value)}
              className="w-full h-11 px-4 text-sm rounded-xl bg-[#0c0c0e]/80 border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#acb9ca]/85 block">
                Género <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender("MALE")}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                    gender === "MALE"
                      ? "bg-[#66b2ff]/10 border-[#66b2ff] text-[#66b2ff]"
                      : "bg-[#0c0c0e]/60 border-[#4e4e52]/30 text-[#acb9ca]/60 hover:border-[#4e4e52]/60 hover:text-[#acb9ca]"
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-sm">♂️</span> Hombre
                </button>
                <button
                  type="button"
                  onClick={() => setGender("FEMALE")}
                  className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                    gender === "FEMALE"
                      ? "bg-pink-500/10 border-pink-500 text-pink-400"
                      : "bg-[#0c0c0e]/60 border-[#4e4e52]/30 text-[#acb9ca]/60 hover:border-[#4e4e52]/60 hover:text-[#acb9ca]"
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-sm">♀️</span> Mujer
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#acb9ca]/85">
                Precio <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#acb9ca]/40">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full h-11 pl-8 pr-4 text-sm rounded-xl bg-[#0c0c0e]/80 border border-[#4e4e52]/40 text-white placeholder-[#acb9ca]/30 focus:border-[#66b2ff] focus:ring-1 focus:ring-[#66b2ff] transition-all outline-none font-mono"
                  disabled={isSubmitting}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm h-12 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin mr-2" />
                  Creando Ticket...
                </>
              ) : (
                "Guardar Ticket"
              )}
            </button>
          </div>
        </form>
      )}
    </main>
  );

  function setGenderOrNumber(val: string) {
    setPriceOrVal(val);
  }

  function setPriceOrVal(val: string) {
    setNumberAssoc(val);
  }
}
