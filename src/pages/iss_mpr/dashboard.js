import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { Paper, Select, Badge } from "@mantine/core";
import {
  IconCalendar,
  IconChartBar,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconChecklist,
  IconX,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { mprOnly } from "@/data/sidebar/employee";

// ─── STATUS MAP ───────────────────────────────────────────────────────────────

const statusMap = {
  0: { label: "Draft", color: "gray" },
  1: { label: "Pending Approval", color: "yellow" },
  2: { label: "Completed", color: "green" },
  3: { label: "Rejected", color: "red" },
};

// ─── BREAKDOWN CARD ───────────────────────────────────────────────────────────

function BreakdownCard({ title, icon, data, color }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <Paper radius="md" withBorder p="lg">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-md font-semibold">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">
          {data.length} types
        </span>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          data.map((d) => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-1">
                <span
                  className="text-gray-700 truncate max-w-[70%]"
                  title={d.name}
                >
                  {d.name}
                </span>
                <span className="font-semibold text-gray-800 ml-2">
                  {d.count}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Paper>
  );
}

// ─── DEPT CAROUSEL ────────────────────────────────────────────────────────────

function DeptCarousel({ data, loading }) {
  const [current, setCurrent] = useState(0);
  const visibleCount = 4;
  const total = data.length;
  const canPrev = current > 0;
  const canNext = current + visibleCount < total;
  const visible = data.slice(current, current + visibleCount);

  if (loading)
    return <p className="text-sm text-gray-400 text-center py-4">Loading...</p>;
  if (total === 0)
    return <p className="text-sm text-gray-400 text-center py-4">No data</p>;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        disabled={!canPrev}
        className="p-1 rounded-full border text-gray-500 disabled:opacity-30 hover:bg-gray-50"
      >
        <IconChevronLeft size={18} />
      </button>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {visible.map((d) => (
          <div
            key={d.name}
            className="flex-1 border rounded-xl p-4 text-center shadow-sm bg-white"
          >
            <p
              className="text-sm font-semibold text-cyan-600 mb-1 truncate"
              title={d.name}
            >
              {d.name}
            </p>
            <p className="text-3xl font-bold text-gray-800">{d.count}</p>
            <p className="text-xs text-gray-400 mt-1">Total</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCurrent((c) => Math.min(total - visibleCount, c + 1))}
        disabled={!canNext}
        className="p-1 rounded-full border text-gray-500 disabled:opacity-30 hover:bg-gray-50"
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function IssMprDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    byDepartment: [],
    byProject: [],
    monthlyRequests: [],
    recent: [],
  });

  const fetchDashboard = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/iss_mpr/dashboard?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setStats({
        total: data.total ?? 0,
        pending: data.pending ?? 0,
        completed: data.completed ?? 0,
        rejected: data.rejected ?? 0,
        byDepartment: data.by_department || [],
        byProject: data.by_project || [],
        monthlyRequests: data.monthly_requests || [],
        recent: data.recent || [],
      });
      if (data.available_years?.length > 0) {
        setAvailableYears(
          data.available_years.map((y) => ({
            value: String(y),
            label: String(y),
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch MPR stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statCards = [
    {
      label: "Total MPR",
      value: stats.total,
      color: "#228be6",
      bg: "#e7f5ff",
      icon: <IconUsers size={28} />,
    },
    {
      label: "Pending Approval",
      value: stats.pending,
      color: "#f08c00",
      bg: "#fff3bf",
      icon: <IconClock size={28} />,
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "#2f9e44",
      bg: "#ebfbee",
      icon: <IconChecklist size={28} />,
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "#e03131",
      bg: "#ffe3e3",
      icon: <IconX size={28} />,
    },
  ];

  const maxMonthly = Math.max(...stats.monthlyRequests.map((m) => m.count), 1);

  return (
    <AuthLayout sidebarList={mprOnly}>
      <Head>
        <title>MPR Dashboard — HRMS</title>
      </Head>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* HEADER + YEAR FILTER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Manpower Request Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of all manpower requests
            </p>
          </div>
          <Select
            size="sm"
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            data={availableYears}
            placeholder="Select year"
            style={{ width: 110 }}
          />
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <Paper key={card.label} radius="md" withBorder p="lg">
              <div className="flex items-center gap-4">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: card.color }}
                  >
                    {loading ? "—" : card.value}
                  </p>
                </div>
              </div>
            </Paper>
          ))}
        </div>

        {/* CAROUSEL BY DEPARTMENT */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center gap-2 mb-4">
            <IconChartBar size={18} className="text-cyan-600" />
            <h2 className="text-md font-semibold">
              Overall Request By Department
            </h2>
          </div>
          <DeptCarousel data={stats.byDepartment} loading={loading} />
        </Paper>

        {/* MONTHLY CHART */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center gap-2 mb-6">
            <IconCalendar size={18} className="text-blue-600" />
            <h2 className="text-md font-semibold">
              MPR per Month — {selectedYear}
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.monthlyRequests.map((m) => (
                <div
                  key={m.month}
                  className="flex flex-col items-center flex-1 gap-1"
                >
                  <span className="text-xs font-semibold text-gray-600">
                    {m.count > 0 ? m.count : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${(m.count / maxMonthly) * 100}px`,
                      minHeight: m.count > 0 ? "8px" : "2px",
                      backgroundColor: m.count > 0 ? "#228be6" : "#e9ecef",
                    }}
                  />
                  <span className="text-xs text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </Paper>

        {/* BOTTOM ROW: BY PROJECT + RECENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* BY PROJECT */}
          <BreakdownCard
            title="By Project"
            icon={<IconChartBar size={18} className="text-green-600" />}
            data={loading ? [] : stats.byProject}
            color="#2f9e44"
          />

          {/* RECENT REQUESTS */}
          <Paper radius="md" withBorder p="lg">
            <div className="flex items-center gap-2 mb-4">
              <IconClock size={18} className="text-blue-600" />
              <h2 className="text-md font-semibold">
                Recent Manpower Requests
              </h2>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : stats.recent.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((r) => (
                  <div
                    key={r.mpr_id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {r.mpr_no}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.department} · {r.project} ·{" "}
                        {r.created_date
                          ? new Date(r.created_date).toISOString().split("T")[0]
                          : "-"}
                      </p>
                    </div>
                    <Badge
                      color={statusMap[r.mpr_status]?.color ?? "gray"}
                      variant="filled"
                      size="sm"
                    >
                      {statusMap[r.mpr_status]?.label ?? "Unknown"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
