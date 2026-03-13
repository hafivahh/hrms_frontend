import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { Paper, Select } from "@mantine/core";
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconCalendar,
  IconGenderMale,
  IconGenderFemale,
  IconBuildingSkyscraper,
  IconBuildingFactory2,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { employeeOnly } from "@/data/sidebar/employee";

// ─── CAROUSEL CARD ────────────────────────────────────────────────────────────

function CarouselCard({ title, icon, data, loading, subtitle = "Total" }) {
  const [current, setCurrent] = useState(0);
  const visibleCount = 4;
  const total = data.length;
  const canPrev = current > 0;
  const canNext = current + visibleCount < total;
  const visible = data.slice(current, current + visibleCount);

  return (
    <Paper radius="md" withBorder p="lg">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-md font-semibold">{title}</h2>
        <span className="ml-auto text-xs text-gray-400">{data.length} types</span>
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
                <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
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

export default function EmployeeDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();

  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([
    { value: "all", label: "All Years" },
  ]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byGender: { male: 0, female: 0 },
    monthlyJoined: [],
    byDepartment: [],
    byProject: [],   // ← ganti dari byPosition
    byCompany: [],
  });

  const fetchStats = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/employee/dashboard?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setStats({
        total: data.total,
        active: data.active,
        inactive: data.inactive,
        byGender: data.by_gender || { male: 0, female: 0 },
        monthlyJoined: data.monthly_joined || [],
        byDepartment: data.by_department || [],
        byProject: data.by_project || [],   // ← ganti
        byCompany: data.by_company || [],
      });
      if (data.available_years?.length > 0) {
        setAvailableYears([
          { value: "all", label: "All Years" },
          ...data.available_years.map((y) => ({ value: String(y), label: String(y) })),
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch employee stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.token, API_URL, selectedYear]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    { label: "Total Employees", value: stats.total,          icon: <IconUsers size={26} />,       color: "#228be6", bg: "#e7f5ff" },
    { label: "Active",          value: stats.active,         icon: <IconUserCheck size={26} />,   color: "#2f9e44", bg: "#ebfbee" },
    { label: "Inactive",        value: stats.inactive,       icon: <IconUserOff size={26} />,     color: "#e03131", bg: "#fff5f5" },
    { label: "Male",            value: stats.byGender.male,  icon: <IconGenderMale size={26} />,  color: "#1971c2", bg: "#d0ebff" },
    { label: "Female",          value: stats.byGender.female,icon: <IconGenderFemale size={26} />,color: "#c2255c", bg: "#ffdeeb" },
  ];

  const maxMonthly = Math.max(...stats.monthlyJoined.map((m) => m.count), 1);

  return (
    <AuthLayout sidebarList={employeeOnly}>
      <Head>
        <title>Employee Dashboard — HRMS</title>
      </Head>

      <div className="py-6 px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employee Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all employees</p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {statCards.map((card) => (
            <Paper key={card.label} radius="md" withBorder p="md">
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2" style={{ backgroundColor: card.bg, color: card.color }}>
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

        {/* MONTHLY JOIN */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <IconCalendar size={18} className="text-blue-600" />
              <h2 className="text-md font-semibold">
                Employee Join per Month —{" "}
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
              {stats.monthlyJoined.map((m) => (
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

        {/* CAROUSEL CARDS */}
        <div className="flex flex-col gap-4">
          <CarouselCard
            title="By Department"
            icon={<IconBuildingSkyscraper size={18} className="text-blue-600" />}
            data={loading ? [] : stats.byDepartment}
            loading={loading}
            subtitle="Employees"
          />
          <CarouselCard
            title="By Project"
            icon={<IconClipboardList size={18} className="text-violet-600" />}
            data={loading ? [] : stats.byProject}
            loading={loading}
            subtitle="Employees"
          />
          <CarouselCard
            title="By Company"
            icon={<IconBuildingFactory2 size={18} className="text-orange-500" />}
            data={loading ? [] : stats.byCompany}
            loading={loading}
            subtitle="Employees"
          />
        </div>

      </div>
    </AuthLayout>
  );
}