export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex animate-pulse">
      <div className="w-64 bg-card border-r border-card-border h-screen" />
      <div className="flex-1 p-8 space-y-6">
        <div className="h-8 w-48 bg-section-alt rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-card-border p-6 space-y-3">
              <div className="h-4 w-20 bg-section-alt rounded-full" />
              <div className="h-8 w-16 bg-section-alt rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl border border-card-border p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-section-alt rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
