export default function MembresiaLoading() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-pulse">
      <div className="h-16 bg-card border-b border-card-border" />
      <div className="max-w-4xl mx-auto px-6 pt-32">
        <div className="h-4 w-32 bg-section-alt rounded-full mb-4" />
        <div className="h-12 w-2/3 bg-section-alt rounded-xl mb-4" />
        <div className="h-5 w-1/2 bg-section-alt rounded-full mb-16" />
        <div className="bg-card rounded-2xl border border-card-border p-10 space-y-6">
          <div className="h-8 w-40 bg-section-alt rounded-lg" />
          <div className="h-16 w-32 bg-section-alt rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-5 bg-section-alt rounded-full w-full" />
            ))}
          </div>
          <div className="h-14 bg-section-alt rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
