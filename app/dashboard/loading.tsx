export default function DashboardLoading() {
  return (
    <div className="space-y-5 sm:space-y-8 animate-pulse">
      <div>
        <div className="h-8 sm:h-10 w-48 sm:w-60 bg-section-alt rounded-lg mb-2" />
        <div className="h-3 sm:h-4 w-64 sm:w-80 bg-section-alt rounded-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-card-border p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-section-alt rounded-xl" />
              <div className="h-4 sm:h-5 w-12 sm:w-14 bg-section-alt rounded-lg" />
            </div>
            <div className="h-2 sm:h-3 w-20 sm:w-24 bg-section-alt rounded-full" />
            <div className="h-7 sm:h-9 w-16 sm:w-20 bg-section-alt rounded-lg" />
            <div className="h-2 sm:h-3 w-16 sm:w-20 bg-section-alt rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-card-border p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
            <div className="h-3 sm:h-4 w-32 sm:w-40 bg-section-alt rounded-lg" />
            <div className="h-2 sm:h-3 w-24 sm:w-28 bg-section-alt rounded-md" />
            <div className="h-40 sm:h-52 bg-section-alt rounded-lg mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
