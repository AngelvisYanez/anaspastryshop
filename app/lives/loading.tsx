export default function LivesLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-pulse">
      <div className="h-16 bg-card border-b border-card-border" />
      <div className="bg-[#0B1F3A] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="max-w-7xl mx-auto space-y-4 flex flex-col items-center">
          <div className="h-6 w-48 bg-white/10 rounded-full" />
          <div className="h-14 w-2/3 bg-white/10 rounded-xl" />
          <div className="h-5 w-96 bg-white/10 rounded-full" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-card-border p-8 space-y-4">
              <div className="h-6 w-28 bg-section-alt rounded-full" />
              <div className="h-7 w-3/4 bg-section-alt rounded-lg" />
              <div className="h-4 w-full bg-section-alt rounded-full" />
              <div className="h-4 w-1/3 bg-section-alt rounded-full" />
              <div className="h-4 w-1/2 bg-section-alt rounded-full" />
              <div className="h-12 bg-section-alt rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
