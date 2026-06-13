"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 h-20 backdrop-blur-md bg-[#080808]/80 border-b border-[#4e4e52]/20">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group transition-all">
          <span className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-[#66b2ff] via-[#acb9ca] to-[#84d2ff] bg-clip-text text-transparent group-hover:opacity-90">
            FestAdmin
          </span>
        </Link>
        <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-[#66b2ff]/10 text-[#66b2ff] border border-[#66b2ff]/20">
          Admin Portal
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="text-sm font-semibold text-[#acb9ca] hover:text-[#66b2ff] transition-all cursor-pointer">
              Iniciar Sesión
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="bg-gradient-to-r from-[#66b2ff] to-[#84d2ff] text-black font-bold text-sm h-10 px-5 rounded-full hover:shadow-[0_0_15px_rgba(102,178,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#66b2ff]/10 cursor-pointer">
              Registrarse
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <div className="flex items-center justify-center p-0.5 rounded-full border border-white/10 hover:border-[#66b2ff]/40 transition-all">
            <UserButton />
          </div>
        </Show>
      </div>
    </header>
  );
}
