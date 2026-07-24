'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronDown, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { getFilteredHistory, getHistoryExerciseNames, getExerciseAnalytics, type ExerciseAnalytics } from '@/lib/history/queries';
import { EXERCISES } from '@/lib/exercises';
import type { ExerciseHistory } from '@/lib/history/types';
import { getExerciseFeedback } from '@/lib/history/feedback';
import { formatDuration, formatTotalDuration } from '@/lib/history/utils';

const PAGE_SIZE = 20;
type SortOption = 'newest' | 'oldest';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) /
      86400000,
  );
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Yesterday, ${time}`;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function HistoryCardSkeleton() {
  return (
    <div className="neo-card p-4 animate-pulse" style={{ borderRadius: 14, background: 'var(--neo-white)' }}>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 bg-gray-200" style={{ borderRadius: 11 }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 bg-gray-200 rounded" />
          <div className="h-2.5 w-1/4 bg-gray-100 rounded" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-3.5 w-10 bg-gray-200 rounded" />
          <div className="h-2.5 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

const HistoryCard = memo(function HistoryCard({ entry, index }: { entry: ExerciseHistory; index: number }) {
  const exercise = EXERCISES.find((e) => e.name === entry.exercise_name);
  const Icon = exercise?.icon ?? Activity;
  const feedback = getExerciseFeedback(entry.exercise_name, entry.accuracy_score);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        href={`/history/${entry.id}`}
        aria-label={`${entry.exercise_name}, ${Math.round(entry.accuracy_score)}% accuracy, ${formatDate(entry.completed_at)}`}
        className="neo-card p-4 block hover:opacity-90 transition-opacity"
        style={{ borderRadius: 14, background: 'var(--neo-white)' }}
      >
        {/* Top row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 flex items-center justify-center shrink-0 neo-card-accent"
            style={{ borderRadius: 11 }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-app truncate">{entry.exercise_name}</div>
            <div className="text-xs text-subtle mt-0.5">{formatDate(entry.completed_at)}</div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className="text-xs font-black px-2 py-0.5 neo-card"
              style={{ borderRadius: 6, background: 'var(--neo-yellow)', fontSize: '0.7rem' }}
            >
              {Math.round(entry.accuracy_score)}%
            </span>
            {entry.repetitions != null && (
              <span className="text-xs text-subtle">{entry.repetitions} reps</span>
            )}
            {entry.duration_seconds != null && entry.repetitions == null && (
              <span className="text-xs text-subtle">{formatDuration(entry.duration_seconds)}</span>
            )}
          </div>
        </div>
        {/* Feedback */}
        <div
          className="px-3 py-2 text-xs text-subtle leading-relaxed"
          style={{ borderRadius: 8, background: 'var(--page-bg, #f5f5f0)', borderLeft: '3px solid var(--neo-black)' }}
        >
          {feedback}
        </div>
      </Link>
    </motion.div>
  );
});

function ExerciseAnalyticsSummary({
  analytics,
  loading,
}: {
  analytics: ExerciseAnalytics | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div
        className="neo-card p-4 mb-5 animate-pulse"
        style={{ borderRadius: 14, background: 'var(--card-bg-green)' }}
      >
        <div className="h-3 w-24 bg-black/10 rounded mb-3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="neo-card p-3" style={{ borderRadius: 10, background: 'var(--neo-white)' }}>
              <div className="h-5 w-10 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-14 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (!analytics) return null;

  const stats: { label: string; value: string }[] = [
    { label: 'Avg Accuracy', value: `${Math.round(analytics.avgAccuracy)}%` },
    { label: 'Best Accuracy', value: `${Math.round(analytics.bestAccuracy)}%` },
    { label: 'Total Sessions', value: analytics.totalSessions.toString() },
    { label: 'Last Completed', value: formatDate(analytics.lastCompleted) },
  ];
  if (analytics.totalRepetitions != null) {
    stats.splice(3, 0, { label: 'Total Reps', value: analytics.totalRepetitions.toLocaleString() });
  }
  if (analytics.totalDurationSeconds != null) {
    stats.splice(analytics.totalRepetitions != null ? 4 : 3, 0, {
      label: 'Total Duration',
      value: formatTotalDuration(analytics.totalDurationSeconds),
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="neo-card p-4 mb-5"
      style={{ borderRadius: 14, background: 'var(--card-bg-green)' }}
    >
      <div className="text-xs font-black uppercase tracking-wider text-subtle mb-3">Analytics</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="neo-card p-3"
            style={{ borderRadius: 10, background: 'var(--neo-white)' }}
          >
            <div className="text-lg font-black text-app leading-tight">{stat.value}</div>
            <div className="text-xs text-subtle mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();

  const [entries, setEntries] = useState<ExerciseHistory[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [analytics, setAnalytics] = useState<ExerciseAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(searchRaw.trim()), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchRaw]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    getHistoryExerciseNames().then(setExerciseNames);
  }, [user?.id]);

  useEffect(() => {
    if (!activeFilter || !user) { setAnalytics(null); return; }
    setAnalytics(null);
    setAnalyticsLoading(true);
    getExerciseAnalytics(activeFilter).then((result) => {
      setAnalytics(result);
      setAnalyticsLoading(false);
    });
  }, [activeFilter, user?.id]);

  const fetchPage = useCallback(
    async (pg: number, append: boolean) => {
      if (!user) return;
      if (append) setLoadingMore(true);
      else { setLoading(true); setError(null); }

      try {
        const result = await getFilteredHistory({
          page: pg,
          pageSize: PAGE_SIZE,
          exerciseName: activeFilter || null,
          search: search || null,
          sort,
        });
        setEntries((prev) => append ? [...prev, ...result.data] : result.data);
        setHasMore(result.hasMore);
        setPage(pg);
      } catch {
        setError('Failed to load history. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id, activeFilter, search, sort],
  );

  useEffect(() => { fetchPage(0, false); }, [fetchPage]);

  return (
    <div className="min-h-screen page-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Link
              href="/dashboard"
              aria-label="Back to dashboard"
              className="neo-card p-2 flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ borderRadius: 10 }}
            >
              <ArrowLeft className="w-5 h-5 text-app" aria-hidden="true" />
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-app">Exercise History</h1>
          </div>

          <div
            className="neo-card flex items-center gap-3 px-4 py-3"
            style={{ borderRadius: 12, background: 'var(--neo-white)' }}
          >
            <Search className="w-4 h-4 text-subtle shrink-0" />
            <input
              type="text"
              aria-label="Search exercises"
              placeholder="Search exercises…"
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              className="flex-1 bg-transparent text-sm text-app placeholder:text-muted outline-none"
            />
            {searchRaw && (
              <button
                onClick={() => setSearchRaw('')}
                className="text-subtle hover:text-app text-xs font-bold transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter chips + Sort */}
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter(null)}
              aria-pressed={activeFilter === null}
              className="neo-card px-3 py-1.5 text-xs font-bold transition-colors"
              style={{
                borderRadius: 20,
                background: activeFilter === null ? 'var(--neo-black)' : 'var(--neo-white)',
                color: activeFilter === null ? '#fff' : 'var(--neo-black)',
              }}
            >
              All
            </button>
            {exerciseNames.map((name) => (
              <button
                key={name}
                onClick={() => setActiveFilter(activeFilter === name ? null : name)}
                aria-pressed={activeFilter === name}
                className="neo-card px-3 py-1.5 text-xs font-bold transition-colors"
                style={{
                  borderRadius: 20,
                  background: activeFilter === name ? 'var(--neo-yellow)' : 'var(--neo-white)',
                  color: 'var(--neo-black)',
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="relative shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen((o) => !o)}
              aria-expanded={sortOpen}
              aria-haspopup="listbox"
              className="neo-card flex items-center gap-2 px-3 py-1.5 text-xs font-bold"
              style={{ borderRadius: 10, background: 'var(--neo-white)' }}
            >
              {sort === 'newest' ? 'Newest' : 'Oldest'}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 neo-card overflow-hidden z-20"
                  style={{ borderRadius: 10, background: 'var(--neo-white)', minWidth: 110 }}
                >
                  {(['newest', 'oldest'] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors"
                      style={{ background: sort === opt ? 'var(--neo-yellow)' : undefined }}
                    >
                      {sort === opt ? '✓ ' : ''}{opt === 'newest' ? 'Newest' : 'Oldest'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeFilter && (
            <ExerciseAnalyticsSummary key={activeFilter} analytics={analytics} loading={analyticsLoading} />
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <HistoryCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div
            className="neo-card p-8 text-center"
            style={{ borderRadius: 16, background: 'var(--card-bg-amber)' }}
          >
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-sm font-bold text-app mb-4">{error}</p>
            <button
              onClick={() => fetchPage(0, false)}
              className="neo-card px-5 py-2.5 text-sm font-bold"
              style={{ borderRadius: 10, background: 'var(--neo-yellow)' }}
            >
              Try again
            </button>
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="neo-card p-10 text-center"
            style={{ borderRadius: 16, background: 'var(--neo-white)' }}
          >
            <div className="text-5xl mb-4">🏃</div>
            <p className="font-display text-lg font-bold text-app mb-2">No workouts yet</p>
            <p className="text-sm text-subtle mb-6">
              {search || activeFilter
                ? 'No workouts match your filters.'
                : 'Complete your first workout to start building your history.'}
            </p>
            {search || activeFilter ? (
              <button
                onClick={() => { setSearchRaw(''); setActiveFilter(null); }}
                className="neo-card px-5 py-2.5 text-sm font-bold"
                style={{ borderRadius: 10, background: 'var(--neo-yellow)' }}
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="neo-card px-5 py-2.5 text-sm font-bold inline-block"
                style={{ borderRadius: 10, background: 'var(--neo-yellow)' }}
              >
                Go to Dashboard
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <div className="space-y-3">
              {entries.map((entry, i) => (
                <HistoryCard key={entry.id} entry={entry} index={i} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchPage(page + 1, true)}
                  disabled={loadingMore}
                  className="neo-card px-6 py-3 text-sm font-bold disabled:opacity-60 transition-opacity"
                  style={{ borderRadius: 12, background: 'var(--neo-yellow)' }}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}

            {!hasMore && (
              <p className="text-center text-xs text-muted mt-8">
                {entries.length} workout{entries.length !== 1 ? 's' : ''} total
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}
