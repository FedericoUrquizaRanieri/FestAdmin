export default function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col justify-between h-48 p-6 rounded-2xl border border-[#4e4e52]/10 bg-[#080808]/30">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="h-5 w-20 bg-[#4e4e52]/30 rounded" />
          <div className="h-4 w-24 bg-[#4e4e52]/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-[#4e4e52]/30 rounded" />
          <div className="h-6 w-1/2 bg-[#4e4e52]/30 rounded" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#4e4e52]/10">
        <div className="flex items-center gap-1.5 w-1/2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#4e4e52]/30" />
          <div className="h-4 w-2/3 bg-[#4e4e52]/20 rounded" />
        </div>
        <div className="h-4 w-16 bg-[#4e4e52]/30 rounded" />
      </div>
    </div>
  );
}
