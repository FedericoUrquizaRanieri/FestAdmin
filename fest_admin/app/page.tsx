"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect to /homePage if already signed in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/homePage");
    }
  }, [isLoaded, isSignedIn, router]);

  // Loading state (Clerk authentication loading)
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // If already signed in, we show loading while redirecting
  if (isSignedIn) {
    return <LoadingSpinner />;
  }

  // Landing / Presentation page (User not logged in)
  return (
    <main className="flex flex-col flex-1 items-center justify-center px-6 py-12 md:py-24 bg-[#080808] relative overflow-hidden">
      {/* Abstract glowing backgrounds */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#66b2ff]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-gradient-to-tr from-[#84d2ff]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center">
        {/* Hero text */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Administración Inteligente para tus{" "}
          <span className="bg-gradient-to-r from-[#66b2ff] via-[#acb9ca] to-[#84d2ff] bg-clip-text text-transparent">
            Eventos y Festivales
          </span>
        </h1>

        <p className="text-base md:text-xl text-[#acb9ca]/80 max-w-2xl mb-10 leading-relaxed">
          Simplifica la venta de entradas, el soporte automatizado con IA en WhatsApp, la visualización de ingresos y la validación en puerta de forma simple y centralizada.
        </p>

        {/* Call to action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto bg-gradient-to-r from-[#66b2ff] to-[#84d2ff] text-black font-bold text-base h-14 px-8 rounded-full hover:shadow-[0_0_25px_rgba(102,178,255,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-[#66b2ff]/15 cursor-pointer">
              Comenzar Ahora
            </button>
          </SignInButton>
        </div>
      </div>
    </main>
  );
}
