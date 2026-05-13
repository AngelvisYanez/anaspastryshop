export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-10 w-60 bg-section-alt rounded-lg mb-2" />
        <div className="h-4 w-80 bg-section-alt rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-card-border p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 bg-section-alt rounded-xl" />
              <div className="h-5 w-14 bg-section-alt rounded-lg" />
            </div>
            <div className="h-3 w-24 bg-section-alt rounded-full" />
            <div className="h-9 w-20 bg-section-alt rounded-lg" />
            <div className="h-3 w-20 bg-section-alt rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-card-border p-6 md:p-8 space-y-4">
            <div className="h-4 w-40 bg-section-alt rounded-lg" />
            <div className="h-3 w-28 bg-section-alt rounded-md" />
            <div className="h-52 bg-section-alt rounded-lg mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
