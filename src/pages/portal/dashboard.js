import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import React, { useEffect, useState, useCallback } from "react";
import { Paper, Badge, Select } from "@mantine/core";
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconClock,
  IconCalendar,
} from "@tabler/icons-react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { adminOnly } from "@/data/sidebar/employee";

export default function Dashboard() {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;

  // ← default "all"
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([
    { value: "all", label: "All Years" },
  ]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentUsers: [],
    monthlyRegistrations: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_URL}/api/user/dashboard?year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setStats({
        total: data.total,
        active: data.active,
        inactive: data.inactive,
        recentUsers: data.recent_users || [],
        monthlyRegistrations: data.monthly_registrations || [],
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

  const statCards = [
    { label: "Total Users",    value: stats.total,    icon: <IconUsers size={28} />,     color: "#228be6", bg: "#e7f5ff" },
    { label: "Active Users",   value: stats.active,   icon: <IconUserCheck size={28} />, color: "#2f9e44", bg: "#ebfbee" },
    { label: "Inactive Users", value: stats.inactive, icon: <IconUserOff size={28} />,   color: "#e03131", bg: "#fff5f5" },
  ];

  const maxCount = Math.max(
    ...stats.monthlyRegistrations.map((m) => m.count),
    1,
  );

  return (
    <AuthLayout sidebarList={adminOnly}>
      <Head>
        <title>Dashboard — HRMS</title>
      </Head>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Portal User Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of all registered portal users
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statCards.map((card) => (
            <Paper key={card.label} radius="md" withBorder p="lg">
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3" style={{ backgroundColor: card.bg, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold" style={{ color: card.color }}>
                    {loading ? "—" : card.value}
                  </p>
                </div>
              </div>
            </Paper>
          ))}
        </div>

        {/* MONTHLY REGISTRATIONS */}
        <Paper radius="md" withBorder p="lg" mb="md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <IconCalendar size={18} className="text-blue-600" />
              <h2 className="text-md font-semibold">
                User Registrations —{" "}
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
              {stats.monthlyRegistrations.map((m) => (
                <div key={m.month} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-semibold text-gray-600">
                    {m.count > 0 ? m.count : ""}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300"
                    style={{
                      height: `${(m.count / maxCount) * 100}px`,
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

        {/* RECENT USERS */}
        <Paper radius="md" withBorder p="lg">
          <div className="flex items-center gap-2 mb-4">
            <IconClock size={18} className="text-blue-600" />
            <h2 className="text-md font-semibold">Recently Added Users</h2>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : stats.recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400">No data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs uppercase">
                    <th className="pb-2 pr-4">Full Name</th>
                    <th className="pb-2 pr-4">Username</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Created Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((u) => (
                    <tr key={u.id_user} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{u.full_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{u.username}</td>
                      <td className="py-2 pr-4 text-gray-500">{u.role_name}</td>
                      <td className="py-2 pr-4 text-gray-500">{u.created_date}</td>
                      <td className="py-2">
                        <Badge
                          color={Number(u.status_user) === 1 ? "green" : "red"}
                          variant="filled"
                          size="sm"
                        >
                          {Number(u.status_user) === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Paper>
      </div>
    </AuthLayout>
  );
}