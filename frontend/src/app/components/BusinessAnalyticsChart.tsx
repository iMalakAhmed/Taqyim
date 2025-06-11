'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useGetBusinessAnalyticsQuery } from '@/app/redux/services/analyticsApi';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

const TABS = ['Overview', 'Review Volume', 'Rating Trends', 'Sentiment'];

const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

export default function BusinessAnalyticsDashboard() {
  const { id } = useParams();
  const businessId = parseInt(id as string, 10);
  const { data, isLoading, isError } = useGetBusinessAnalyticsQuery(businessId);
  const [tab, setTab] = useState('Overview');

  if (isLoading) {
    return <p className="text-gray-500 animate-pulse">Loading analytics...</p>;
  }

  if (isError || !data) {
    return <p className="text-red-500">Failed to load analytics.</p>;
  }

  const sentimentData = Object.entries(data.sentimentBreakdown).map(
    ([label, count], i) => ({
      name: label,
      value: count,
      color: COLORS[i % COLORS.length],
    })
  );

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-5xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Business Analytics</h2>

      {/* Tabs */}
      <div className="flex gap-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full transition-all font-medium ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="pt-2"
      >
        {tab === 'Overview' && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard title="Total Reviews" value={data.totalReviews} />
              <StatCard title="Average Rating" value={data.averageRating.toFixed(2)} />
              <StatCard title="Followers" value={data.followerCount} />
              <StatCard title="Media Uploaded" value={data.totalMediaCount} />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-medium mb-2">Top Reviewers</h3>
              <ul className="space-y-2">
                {data.topReviewers.map((r) => (
                  <li key={r.userId} className="flex justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{r.username}</span>
                    <span>
                      {r.reviewCount} reviews ({r.averageRatingGiven.toFixed(1)}★)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {data.mostLikedReview && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <h4 className="font-semibold mb-1">Most Liked Review</h4>
                <p className="italic text-gray-700">“{data.mostLikedReview.commentSnippet}”</p>
                <p className="text-sm text-gray-500 mt-1">
                  Reactions: {data.mostLikedReview.reactionCount}
                </p>
              </div>
            )}
          </>
        )}

        {tab === 'Review Volume' && (
          <ChartWrapper title="Review Volume Over Time">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyReviews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviewCount" fill="#8884d8" name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {tab === 'Rating Trends' && (
          <ChartWrapper title="Average Rating Over Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyReviews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  name="Avg Rating"
                  stroke="#82ca9d"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {tab === 'Sentiment' && (
          <ChartWrapper title="Sentiment Breakdown">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend verticalAlign="bottom" />
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  label
                  outerRadius={100}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <p className="text-lg font-bold">{title}</p>
      <p>{value}</p>
    </div>
  );
}

function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="h-[400px] bg-white p-4 rounded-xl shadow">
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
