export default function CursosLoading() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="h-16 bg-card border-b border-card-border" />
      <div className="bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 space-y-4">
          <div className="h-4 w-40 bg-white/10 rounded-full animate-pulse" />
          <div className="h-14 w-2/3 bg-white/10 rounded-xl animate-pulse" />
          <div className="h-5 w-1/2 bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-card-border overflow-hidden animate-pulse">
              <div className="h-60 bg-section-alt" />
              <div className="p-7 space-y-3">
                <div className="h-3 w-20 bg-section-alt rounded-full" />
                <div className="h-6 w-3/4 bg-section-alt rounded-lg" />
                <div className="h-4 w-1/2 bg-section-alt rounded-full" />
                <div className="h-px bg-card-border mt-4" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-8 w-16 bg-section-alt rounded-lg" />
                  <div className="h-12 w-12 bg-section-alt rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
