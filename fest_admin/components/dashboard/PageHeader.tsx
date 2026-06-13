"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  borderBottom?: boolean;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Volver",
  actions,
  borderBottom = true,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {backHref && (
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#acb9ca]/70 hover:text-[#66b2ff] transition-colors"
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
            {backLabel}
          </Link>
        </div>
      )}

      <div
        className={`flex flex-col md:flex-row md:items-baseline justify-between gap-4 ${
          borderBottom ? "border-b border-[#4e4e52]/10 pb-4" : ""
        }`}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <div className="text-xs text-[#acb9ca]/60 mt-1">
              {subtitle}
            </div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
