"use client";

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
} from "recharts";
import { useGetBusinessAnalyticsQuery } from "@/app/redux/services/analyticsApi";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

const TABS = ["Overview", "Review Volume", "Rating Trends", "Sentiment"];
const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#0088FE", "#FF6B6B"];

export default function BusinessAnalyticsDashboard() {
  const { id } = useParams();
  const businessId = parseInt(id as string, 10);
  const { data, isLoading, isError } = useGetBusinessAnalyticsQuery(businessId);
  const [tab, setTab] = useState("Overview");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Failed to load analytics.</p>
      </div>
    );
  }

  const sentimentData = Object.entries(data.sentimentBreakdown).map(
    ([label, count], i) => ({
      name: label,
      value: count,
      color: COLORS[i % COLORS.length],
    })
  );

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Business Analytics</h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                tab === t
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-2"
      >
        {tab === "Overview" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Reviews"
                value={data.totalReviews}
                icon="📝"
              />
              <StatCard
                title="Average Rating"
                value={data.averageRating.toFixed(2)}
                icon="⭐"
              />
              <StatCard
                title="Followers"
                value={data.followerCount}
                icon="👥"
              />
              <StatCard
                title="Media Uploaded"
                value={data.totalMediaCount}
                icon="🖼️"
              />
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Top Reviewers
                </h3>
                <ul className="space-y-3">
                  {data.topReviewers.map((r) => (
                    <li
                      key={r.userId}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow-xs border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <span className="font-medium text-gray-700">
                        {r.username}
                      </span>
                      <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                        {r.reviewCount} reviews •{" "}
                        {r.averageRatingGiven.toFixed(1)}★
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {data.mostLikedReview && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600 text-lg">🌟</span>
                    <h4 className="font-semibold text-gray-800">
                      Most Liked Review
                    </h4>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-xs">
                    <p className="italic text-gray-700 mb-2">
                      “{data.mostLikedReview.commentSnippet}”
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {data.mostLikedReview.reactionCount} reactions
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {tab === "Review Volume" && (
          <ChartWrapper title="Review Volume Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyReviews}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280" }}
                  axisLine={false}
                />
                <YAxis tick={{ fill: "#6b7280" }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="reviewCount"
                  fill="#4f46e5"
                  name="Reviews"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {tab === "Rating Trends" && (
          <ChartWrapper title="Average Rating Over Time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyReviews}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280" }}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fill: "#6b7280" }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="averageRating"
                  name="Avg Rating"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981" }}
                  activeDot={{ r: 6, stroke: "#059669" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}

        {tab === "Sentiment" && (
          <ChartWrapper title="Sentiment Analysis">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} reviews`, "Count"]}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ChartWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}
