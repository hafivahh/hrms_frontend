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
  IconUserCheck,
  IconChecklist,
  IconX,
  IconClipboardList,
  IconCircleCheck,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { recruitmentOnly } from "@/data/sidebar/employee";

// ─── STATUS MAP ───────────────────────────────────────────────────────────────

const recruitmentStatusMap = {
  1: { label: "Open",                  color: "green"  },
  2: { label: "Fulfillment in Progress", color: "blue" },
  3: { label: "Closed",                color: "gray"   },
  4: { label: "Cancel",                color: "red"    },
};

// ─── DEPT CAROUSEL ────────────────────────────────────────────────────────────

function DeptCarousel({ title, icon, data, loading }) {
  const [current, setCurrent] = useState(0);
  const visibleCount = 4;
  const total = data.length;
  const canPrev = current > 0;
  const canNext = current + visibleCount < total;
  const visible = data.slice(current, current + visibleCount);

  return (
    <Paper radius="md" withBorder p="lg" mb="md">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-md font-semibold">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{data.length} items</span>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
      ) : total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No data</p>
      ) : (
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
                <p className="text-sm font-semibold text-cyan-600 mb-1 truncate" title={d.name}>
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
      )}
    </Paper>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function RecruitmentDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();

  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([
    { value: "all", label: "All Years" },
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMpr: 0,
    totalApplicants: 0,
    open: 0,
    fulfillment: 0,
    closed: 0,
    cancel: 0,
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
        `${API_URL}/api/iss_recruitment/dashboard?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setStats({
        totalMpr:        data.total_mpr        ?? 0,
        totalApplicants: data.total_applicants ?? 0,
        open:            data.open             ?? 0,
        fulfillment:     data.fulfillment      ?? 0,
        closed:          data.closed           ?? 0,
        cancel:          data.cancel           ?? 0,
        byDepartment:    data.by_department    || [],
        byProject:       data.by_project       || [],
        monthlyRequests: data.monthly_requests || [],
        recent:          data.recent           || [],
      });
      if (data.available_years?.length > 0) {
        setAvailableYears([
          { value: "all", label: "All Years" },
          ...data.available_years.map((y) => ({ value: String(y), label: String(y) })),
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch recruitment dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL, selectedYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statCards = [
    { label: "Total MPR",          value: stats.totalMpr,        color: "#228be6", bg: "#e7f5ff", icon: <IconChartBar size={28} /> },
    { label: "Total Applicants",   value: stats.totalApplicants, color: "#7048e8", bg: "#f3f0ff", icon: <IconUsers size={28} /> },
    { label: "Open",               value: stats.open,            color: "#2f9e44", bg: "#ebfbee", icon: <IconCircleCheck size={28} /> },
    { label: "Fulfillment",        value: stats.fulfillment,     color: "#1971c2", bg: "#d0ebff", icon: <IconUserCheck size={28} /> },
    { label: "Closed",             value: stats.closed,          color: "#495057", bg: "#e9ecef", icon: <IconChecklist size={28} /> },
    { label: "Cancel",             value: stats.cancel,          color: "#e03131", bg: "#ffe3e3", icon: <IconX size={28} /> },
  ];

  const maxMonthly = Math.max(...stats.monthlyRequests.map((m) => m.count), 1);

  return (
    <AuthLayout sidebarList={recruitmentOnly}>
      <Head>
        <title>Recruitment Dashboard — HRMS</title>
      </Head>

      <div className="py-6 px-4 sm:px-6 lg:px-8">

        {/* HEADER + YEAR FILTER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Recruitment Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Overview of all recruitment activities</p>
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {statCards.map((card) => (
            <Paper key={card.label} radius="md" withBorder p="md">
              <div className="flex flex-col gap-2">
                <div className="rounded-xl p-2 w-fit" style={{ backgroundColor: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>
                    {loading ? "—" : card.value}
                  </p>
                </div>
              </div>
            </Paper>
          ))}
        </div>

        {/* MONTHLY CHART */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center gap-2 mb-6">
            <IconCalendar size={18} className="text-blue-600" />
            <h2 className="text-md font-semibold">
              MPR per Month —{" "}
              {selectedYear === "all" ? "All Years" : selectedYear}
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {stats.monthlyRequests.map((m) => (
                <div key={m.month} className="flex flex-col items-center flex-1 gap-1">
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

        {/* CAROUSEL BY DEPARTMENT */}
        <DeptCarousel
          title="Overall MPR By Department"
          icon={<IconChartBar size={18} className="text-cyan-600" />}
          data={loading ? [] : stats.byDepartment}
          loading={loading}
        />

        {/* CAROUSEL BY PROJECT */}
        <DeptCarousel
          title="Overall MPR By Project"
          icon={<IconClipboardList size={18} className="text-green-600" />}
          data={loading ? [] : stats.byProject}
          loading={loading}
        />

        {/* RECENT REQUESTS */}
        <Paper radius="md" withBorder p="lg">
          <div className="flex items-center gap-2 mb-4">
            <IconClock size={18} className="text-blue-600" />
            <h2 className="text-md font-semibold">Recent Recruitment</h2>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : stats.recent.length === 0 ? (
            <p className="text-sm text-gray-400">No data</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.mpr_no}</p>
                    <p className="text-xs text-gray-400">
                      {r.department} · {r.project} · {r.position} · {r.created_date}
                    </p>
                  </div>
                  <Badge
                    color={recruitmentStatusMap[r.recruitment_status]?.color ?? "gray"}
                    variant="filled"
                    size="sm"
                  >
                    {recruitmentStatusMap[r.recruitment_status]?.label ?? "—"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Paper>

      </div>
    </AuthLayout>
  );
}