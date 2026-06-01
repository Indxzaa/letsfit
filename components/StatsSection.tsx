'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Activity, Calendar, CheckCircle2 } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', minutes: 12 },
  { day: 'Tue', minutes: 18 },
  { day: 'Wed', minutes: 0 },
  { day: 'Thu', minutes: 15 },
  { day: 'Fri', minutes: 10 },
  { day: 'Sat', minutes: 22 },
  { day: 'Sun', minutes: 14 },
];

export default function StatsSection() {
  return (
    <section id="progress" className="py-24 sm:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <div className="text-sm font-medium accent-text mb-3">Your progress</div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-app mb-4">
            Small steps, visible progress.
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            A clean dashboard shows what matters: how often you showed up,
            how long you moved, and where your posture is improving.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 surface rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-base font-semibold text-app mb-1">
                  Active minutes this week
                </h3>
                <p className="text-sm text-subtle">
                  Track time spent on guided sessions.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-app">91 min</div>
                <div className="text-xs text-subtle">total</div>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    stroke="var(--text-subtle)"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--text-subtle)"
                    style={{ fontSize: '11px' }}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--text)',
                    }}
                    cursor={{ stroke: 'var(--chart-grid)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="var(--accent-soft)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent-soft)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="surface rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs text-subtle mb-3">
                <Calendar className="w-3.5 h-3.5" />
                Consistency
              </div>
              <div className="text-3xl font-semibold text-app mb-1">
                6 days
              </div>
              <p className="text-xs text-subtle">
                Active streak. Rest days don&apos;t break it.
              </p>
            </div>

            <div className="surface rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs text-subtle mb-3">
                <Activity className="w-3.5 h-3.5" />
                Posture trend
              </div>
              <div className="text-3xl font-semibold text-app mb-1">
                Improving
              </div>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i <= 5 ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 surface rounded-2xl p-6 sm:p-8"
        >
          <h3 className="text-base font-semibold text-app mb-1">
            Recent sessions
          </h3>
          <p className="text-sm text-subtle mb-6">
            A simple log of what you completed.
          </p>

          <div className="divide-y divider">
            {[
              { name: 'Morning mobility', duration: '12 min', day: 'Today' },
              { name: 'Posture check-in', duration: '5 min', day: 'Today' },
              { name: 'Core basics', duration: '15 min', day: 'Yesterday' },
              { name: 'Stretch routine', duration: '10 min', day: '2 days ago' },
            ].map((session) => (
              <div
                key={session.name + session.day}
                className="flex items-center justify-between py-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--border)] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-soft)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-app">
                      {session.name}
                    </div>
                    <div className="text-xs text-subtle">{session.day}</div>
                  </div>
                </div>
                <div className="text-sm text-muted">{session.duration}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
