import Navbar from '@/components/Navbar';

export function Bone({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--surface)] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-10">
          <div className="flex items-center gap-4">
            <Bone className="w-14 h-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-7 w-52" />
            </div>
          </div>
          <Bone className="h-5 w-28" />
        </div>
        {/* Bento row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Bone className="h-36 rounded-3xl" />
          <Bone className="h-36 rounded-3xl" />
          <Bone className="h-36 rounded-3xl" />
          <Bone className="h-36 rounded-3xl" />
        </div>
        {/* XP + FitCoins */}
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Bone className="lg:col-span-2 h-28 rounded-3xl" />
          <Bone className="h-28 rounded-3xl" />
        </div>
        {/* Boss + quests */}
        <Bone className="h-24 rounded-3xl mb-6" />
        <Bone className="h-44 rounded-3xl mb-6" />
        {/* Achievements */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => <Bone key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-28 pb-20">
        <Bone className="h-4 w-48 mb-10" />
        {/* Level hero */}
        <Bone className="h-40 rounded-[28px] mb-6" />
        {/* Stats row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => <Bone key={i} className="h-28 rounded-[20px]" />)}
        </div>
        {/* Boss + titles sections */}
        <Bone className="h-56 rounded-[28px] mb-8" />
        <Bone className="h-48 rounded-[28px] mb-8" />
        {/* Achievement wall */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Bone key={i} className="h-40 rounded-[20px]" />)}
        </div>
      </div>
    </div>
  );
}

export function ShopSkeleton() {
  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div className="space-y-3">
            <Bone className="h-3 w-16" />
            <Bone className="h-11 w-72" />
            <Bone className="h-3 w-80" />
          </div>
          <Bone className="h-16 w-36 rounded-2xl" />
        </div>
        {/* Tab bar */}
        <Bone className="h-12 rounded-2xl mb-8" />
        {/* Item grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => <Bone key={i} className="h-72 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

export function AdventureSkeleton() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 pb-20">
        <Bone className="h-10 w-48 mb-3" />
        <Bone className="h-4 w-64 mb-8" />
        {/* World node trail */}
        <div className="relative h-[640px]">
          {([[18, 10], [60, 32], [14, 56], [58, 78]] as const).map(([l, t], i) => (
            <div key={i} className="absolute" style={{ left: `${l}%`, top: `${t}%`, transform: 'translate(-50%, -50%)' }}>
              <Bone className="w-[120px] h-[120px] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
