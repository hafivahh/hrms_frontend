import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { Paper, Select } from "@mantine/core";
import {
  IconFiles,
  IconCalendar,
  IconFileSpreadsheet,
  IconClock,
  IconBuildingSkyscraper,
  IconClipboardList,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { DocumentOnly } from "@/data/sidebar/employee";

// ─── BREAKDOWN CARD ───────────────────────────────────────────────────────────
function BreakdownCard({ title, icon, data, color }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <Paper radius="md" withBorder p="md">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm sm:text-md font-semibold">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{data.length} types</span>
      </div>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          data.map((d) => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 truncate max-w-[70%]" title={d.name}>
                  {d.name}
                </span>
                <span className="font-semibold text-gray-800 ml-2">{d.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${(d.count / max) * 100}%`, backgroundColor: color }}
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

  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount());
      setCurrent(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = data.length;
  const canPrev = current > 0;
  const canNext = current + visibleCount < total;
  const visible = data.slice(current, current + visibleCount);

  if (loading) return <p className="text-sm text-gray-400 text-center py-4">Loading...</p>;
  if (total === 0) return <p className="text-sm text-gray-400 text-center py-4">No data</p>;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        disabled={!canPrev}
        className="p-1 rounded-full border text-gray-500 disabled:opacity-30 hover:bg-gray-50 flex-shrink-0"
      >
        <IconChevronLeft size={18} />
      </button>
      <div className="flex flex-1 gap-2 overflow-hidden">
        {visible.map((d) => (
          <div
            key={d.name}
            className="flex-1 border rounded-xl p-3 text-center shadow-sm bg-white min-w-0"
          >
            <p className="text-xs sm:text-sm font-semibold text-cyan-600 mb-1 truncate" title={d.name}>
              {d.name}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">{d.count}</p>
            <p className="text-xs text-gray-400 mt-1">Total</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setCurrent((c) => Math.min(total - visibleCount, c + 1))}
        disabled={!canNext}
        className="p-1 rounded-full border text-gray-500 disabled:opacity-30 hover:bg-gray-50 flex-shrink-0"
      >
        <IconChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function IssDocumentsDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();

  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([
    { value: "all", label: "All Years" },
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byFileType: [],
    byDepartment: [],
    byProject: [],
    monthlyUploads: [],
    recentUploads: [],
  });

  const fetchStats = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/iss_documents/dashboard?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setStats({
        total: data.total,
        byFileType: data.by_file_type || [],
        byDepartment: data.by_department || [],
        byProject: data.by_project || [],
        monthlyUploads: data.monthly_uploads || [],
        recentUploads: data.recent_uploads || [],
      });
      if (data.available_years?.length > 0) {
        setAvailableYears([
          { value: "all", label: "All Years" },
          ...data.available_years.map((y) => ({
            value: String(y),
            label: String(y),
          })),
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL, selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const maxMonthly = Math.max(...stats.monthlyUploads.map((m) => m.count), 1);

  return (
    <AuthLayout sidebarList={DocumentOnly}>
      <Head>
        <title>Documents Dashboard — HRMS</title>
      </Head>

      <div className="py-4 px-3 sm:py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Documents Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Overview of all uploaded documents</p>
        </div>

        {/* STAT CARD */}
        <div className="mb-4 sm:mb-6 max-w-xs">
          <Paper radius="md" withBorder p="md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2 flex-shrink-0" style={{ backgroundColor: "#e7f5ff", color: "#228be6" }}>
                <IconFiles size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Documents</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#228be6" }}>
                  {loading ? "—" : stats.total}
                </p>
              </div>
            </div>
          </Paper>
        </div>

        {/* MONTHLY UPLOADS */}
        <Paper radius="md" withBorder p="md" mb="md">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <IconCalendar size={18} className="text-blue-600" />
              <h2 className="text-sm sm:text-md font-semibold">
                Uploads per Month —{" "}
                {selectedYear === "all" ? "All Years" : selectedYear}
              </h2>
            </div>
            <Select
              size="xs"
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              data={availableYears}
              placeholder="Select year"
              style={{ width: 100 }}
            />
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="flex items-end gap-1 sm:gap-2 h-32 sm:h-40">
              {stats.monthlyUploads.map((m) => (
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
                  <span className="text-xs text-gray-400 hidden sm:block">{m.month}</span>
                  <span className="text-xs text-gray-400 block sm:hidden">{m.month?.slice(0, 1)}</span>
                </div>
              ))}
            </div>
          )}
        </Paper>

        {/* BY DEPARTMENT */}
        <Paper radius="md" withBorder p="md" mb="md">
          <div className="flex items-center gap-2 mb-4">
            <IconBuildingSkyscraper size={18} className="text-blue-600" />
            <h2 className="text-sm sm:text-md font-semibold">Overall Documents By Department</h2>
          </div>
          <DeptCarousel data={stats.byDepartment} loading={loading} />
        </Paper>

        {/* BY PROJECT */}
        <Paper radius="md" withBorder p="md" mb="md">
          <div className="flex items-center gap-2 mb-4">
            <IconClipboardList size={18} className="text-violet-600" />
            <h2 className="text-sm sm:text-md font-semibold">Overall Documents By Project</h2>
          </div>
          <DeptCarousel data={stats.byProject} loading={loading} />
        </Paper>

        {/* BY FILE TYPE + RECENT UPLOADS */}
        <div className="flex flex-col gap-4">
          <BreakdownCard
            title="By File Type"
            icon={<IconFileSpreadsheet size={18} className="text-green-600" />}
            data={loading ? [] : stats.byFileType}
            color="#2f9e44"
          />

          <Paper radius="md" withBorder p="md">
            <div className="flex items-center gap-2 mb-4">
              <IconClock size={18} className="text-blue-600" />
              <h2 className="text-sm sm:text-md font-semibold">Recently Uploaded</h2>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : stats.recentUploads.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {stats.recentUploads.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start sm:items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]" title={r.file_name}>
                        {r.file_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.badge_number} · {r.created_date}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex-shrink-0">
                      {r.file_type?.includes("spreadsheetml")
                        ? "xlsx"
                        : r.file_type?.includes("ms-excel")
                          ? "xls"
                          : (r.file_type ?? "-")}
                    </span>
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