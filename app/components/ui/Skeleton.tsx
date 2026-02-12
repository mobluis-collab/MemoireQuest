"use client";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-[var(--card-bg)] animate-pulse ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-5 glass-strong border-b border-[var(--border-glass)]">
        <div className="flex items-center gap-2">
          <Bone className="w-[26px] h-[26px] rounded-[7px]" />
          <Bone className="w-24 h-4 max-sm:hidden" />
        </div>
        <div className="flex items-center gap-2">
          <Bone className="w-20 h-7 rounded-full max-md:hidden" />
          <Bone className="w-9 h-9 rounded-lg" />
          <Bone className="w-7 h-7 rounded-full" />
        </div>
      </div>

      <div className="pt-[52px] flex min-h-screen max-md:block">
        {/* Sidebar skeleton — hidden on mobile */}
        <aside className="w-[260px] shrink-0 border-r border-[var(--border-glass)] p-5 px-3.5 max-md:hidden">
          {/* Progress ring */}
          <div className="flex justify-center mb-5">
            <Bone className="w-[100px] h-[100px] rounded-full" />
          </div>
          {/* Badge */}
          <Bone className="w-36 h-5 rounded-md mb-4 mx-2" />
          {/* Section title */}
          <Bone className="w-12 h-3 rounded mb-3 mx-2" />
          {/* Quest items */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 py-2 px-2.5 mb-0.5">
              <Bone className="w-[22px] h-[22px] rounded" />
              <Bone className="flex-1 h-4 rounded" />
              <Bone className="w-8 h-4 rounded" />
            </div>
          ))}
          {/* Info box */}
          <Bone className="mt-5 h-14 rounded-[10px]" />
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 py-7 px-8 max-md:p-5 max-md:px-4">
          {/* Quest phase chip */}
          <Bone className="w-28 h-6 rounded-lg mb-3" />
          {/* Quest title */}
          <Bone className="w-64 h-7 rounded-lg mb-2 max-sm:w-48" />
          {/* Quest description */}
          <Bone className="w-80 h-4 rounded mb-5 max-sm:w-full" />

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <Bone className="w-20 h-3 rounded" />
              <Bone className="w-8 h-3 rounded" />
            </div>
            <Bone className="w-full h-1 rounded" />
          </div>

          {/* Task cards */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl glass border border-[var(--border-glass)] mb-1.5"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-3 p-4 px-[18px]">
                <Bone className="w-7 h-7 rounded-full" />
                <div className="flex-1">
                  <Bone className="w-48 h-4 rounded mb-1.5 max-sm:w-32" />
                  <Bone className="w-20 h-3 rounded" />
                </div>
                <Bone className="w-3 h-3 rounded" />
              </div>
            </div>
          ))}
        </main>
      </div>

      {/* Mobile bar skeleton — visible only on mobile */}
      <div className="hidden max-md:flex fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[var(--border-glass)] items-center justify-around px-1 py-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 py-2 px-2">
            <Bone className="w-5 h-5 rounded" />
            <Bone className="w-8 h-2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Nav skeleton */}
      <div className="h-[52px] glass-strong border-b border-[var(--border-glass)] flex items-center px-5">
        <Bone className="w-24 h-5 rounded" />
      </div>
      {/* Hero skeleton */}
      <div className="max-w-[680px] mx-auto text-center pt-24 px-5">
        <Bone className="w-40 h-7 rounded-full mx-auto mb-6" />
        <Bone className="w-96 h-14 rounded-lg mx-auto mb-4 max-w-full" />
        <Bone className="w-72 h-5 rounded mx-auto mb-8 max-w-full" />
      </div>
    </div>
  );
}
