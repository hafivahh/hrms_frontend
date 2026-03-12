import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { Paper, Select } from "@mantine/core";
import {
  IconFiles,
  IconCalendar,
  IconFileSpreadsheet,
  IconClock,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { DocumentOnly } from "@/data/sidebar/employee";

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

export default function IssDocumentsDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();

  // ← default "all", bukan tahun sekarang
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([
    { value: "all", label: "All Years" },
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byFileType: [],
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

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Documents Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all uploaded documents
          </p>
        </div>

        {/* STAT CARD */}
        <div className="mb-6 max-w-xs">
          <Paper radius="md" withBorder p="lg">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#e7f5ff", color: "#228be6" }}>
                <IconFiles size={28} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Documents</p>
                <p className="text-3xl font-bold" style={{ color: "#228be6" }}>
                  {loading ? "—" : stats.total}
                </p>
              </div>
            </div>
          </Paper>
        </div>

        {/* MONTHLY UPLOADS */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <IconCalendar size={18} className="text-blue-600" />
              <h2 className="text-md font-semibold">
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
              style={{ width: 110 }}
            />
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
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
                  <span className="text-xs text-gray-400">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </Paper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BY FILE TYPE */}
          <BreakdownCard
            title="By File Type"
            icon={<IconFileSpreadsheet size={18} className="text-green-600" />}
            data={loading ? [] : stats.byFileType}
            color="#2f9e44"
          />

          {/* RECENT UPLOADS */}
          <Paper radius="md" withBorder p="lg">
            <div className="flex items-center gap-2 mb-4">
              <IconClock size={18} className="text-blue-600" />
              <h2 className="text-md font-semibold">Recently Uploaded</h2>
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
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p
                        className="text-sm font-medium text-gray-800 truncate max-w-[200px]"
                        title={r.file_name}
                      >
                        {r.file_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.badge_number} · {r.created_date}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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