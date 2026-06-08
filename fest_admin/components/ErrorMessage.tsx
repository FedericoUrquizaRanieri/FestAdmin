interface ErrorMessageProps {
  message: string | null;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-center max-w-xl mx-auto w-full my-6 animate-fade-in">
      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-3">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-red-400 text-sm font-medium">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-5 py-2 rounded-full hover:bg-red-500/20 transition-all duration-200 cursor-pointer shadow-md shadow-red-950/20"
        >
          Reintentar Carga
        </button>
      )}
    </div>
  );
}
