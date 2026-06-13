interface LoadingSpinnerProps {
  variant?: "full" | "section" | "mini";
}

export default function LoadingSpinner({ variant = "full" }: LoadingSpinnerProps) {
  if (variant === "mini") {
    return (
      <div className="w-5 h-5 border-2 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
    );
  }

  if (variant === "section") {
    return (
      <div className="py-20 flex justify-center w-full">
        <div className="w-10 h-10 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Default "full" variant
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-80px)] bg-[#080808]">
      <div className="relative flex items-center justify-center animate-fade-in">
        {/* Outer neon animated ring */}
        <div className="w-16 h-16 border-4 border-[#66b2ff]/20 border-t-[#66b2ff] rounded-full animate-spin"></div>
        {/* Inner brand label */}
        <div className="absolute text-xs font-semibold text-[#66b2ff] animate-pulse">
          Fest
        </div>
      </div>
    </div>
  );
}

