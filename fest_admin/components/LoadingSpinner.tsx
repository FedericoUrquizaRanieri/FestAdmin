export default function LoadingSpinner() {
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
