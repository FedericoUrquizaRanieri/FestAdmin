interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export default function EmptyState({ icon = "🎫", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 md:p-20 rounded-3xl border border-[#4e4e52]/20 bg-[#080808]/40 backdrop-blur-sm text-center max-w-xl mx-auto w-full mt-6 animate-fade-in shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-[#66b2ff]/10 border border-[#66b2ff]/20 flex items-center justify-center text-3xl mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-[#acb9ca]/70 max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
