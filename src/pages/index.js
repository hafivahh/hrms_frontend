import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import axios from "axios";
import { useRouter } from "next/router";
import { adminOnly } from "@/data/sidebar/employee";
import {
  IconUser,
  IconCalendar,
  IconFolder,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconShield,
  IconSettings,
  IconList,
  IconBriefcase,
  IconClipboardList,
} from "@tabler/icons-react";

// ── Admin Dashboard (id_role=1) ───────────────────────────────────────
function AdminDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recent_users: [],
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    axios
      .get(`${API_URL}/api/user/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(({ data }) => {
        setStats({
          total: data.total ?? 0,
          active: data.active ?? 0,
          inactive: data.inactive ?? 0,
          recent_users: data.recent_users ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.token, API_URL]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: <IconUsers size={20} color="#2563a8" />,
      color: "#2563a8",
      bg: "#e8f0fe",
      link: "/portal/user",
    },
    {
      title: "Active Users",
      value: stats.active,
      icon: <IconUserCheck size={20} color="#059669" />,
      color: "#059669",
      bg: "#d1fae5",
      link: "/portal/user",
    },
    {
      title: "Inactive Users",
      value: stats.inactive,
      icon: <IconUserOff size={20} color="#dc2626" />,
      color: "#dc2626",
      bg: "#fee2e2",
      link: "/portal/user",
    },
  ];

  const quickLinks = [
    {
      label: "User List",
      desc: "Manage portal users",
      icon: <IconUsers size={19} color="#2563a8" />,
      bg: "#e8f0fe",
      url: "/portal/user",
    },
    {
      label: "Create User",
      desc: "Add new portal user",
      icon: <IconUserCheck size={19} color="#059669" />,
      bg: "#d1fae5",
      url: "/portal/create",
    },
    {
      label: "Control Permission",
      desc: "Manage app permissions",
      icon: <IconShield size={19} color="#7c3aed" />,
      bg: "#ede9fe",
      url: "/permission/application",
    },
    {
      label: "Master Role",
      desc: "Configure user roles",
      icon: <IconSettings size={19} color="#d97706" />,
      bg: "#fef3c7",
      url: "/master/role/list",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fa",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)",
          padding: isMobile ? "28px 20px" : "40px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "100px",
            bottom: "-100px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              margin: "0 0 8px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {today}
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: isMobile ? "22px" : "30px",
              margin: "0 0 8px",
              fontWeight: "700",
            }}
          >
            {greeting()}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "13px",
              margin: 0,
              fontFamily: "sans-serif",
            }}
          >
            Administrator · Human Resources Management System
          </p>
        </div>
      </div>

      <div
        style={{
          padding: isMobile ? "20px 16px 32px" : "28px 32px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {statCards.map(({ title, value, icon, color, bg, link }) => (
            <div
              key={title}
              onClick={() => router.push(link)}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                borderLeft: `5px solid ${color}`,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    color: "#888",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    margin: 0,
                    fontFamily: "sans-serif",
                  }}
                >
                  {title}
                </p>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </div>
              </div>
              <p
                style={{
                  fontSize: "40px",
                  fontWeight: "800",
                  color: "#1e3a5f",
                  margin: "0 0 4px",
                  lineHeight: 1,
                  fontFamily: "sans-serif",
                }}
              >
                {loading ? "—" : value}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color,
                  fontSize: "13px",
                  fontFamily: "sans-serif",
                  marginTop: "12px",
                }}
              >
                <span>View all users</span>
                <IconArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>

        {/* QUICK LINKS + RECENT USERS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Quick Links */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e3a5f",
                fontFamily: "sans-serif",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {quickLinks.map(({ label, desc, icon, bg, url }) => (
                <div
                  key={label}
                  onClick={() => router.push(url)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f4f8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1e3a5f",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#9ca3af",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                  <IconArrowRight size={15} color="#d1d5db" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e3a5f",
                  fontFamily: "sans-serif",
                }}
              >
                Recent Users
              </h3>
              <span
                onClick={() => router.push("/portal/user")}
                style={{
                  fontSize: "12px",
                  color: "#2563a8",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: "sans-serif",
                }}
              >
                View all <IconArrowRight size={12} />
              </span>
            </div>

            {loading ? (
              <p
                style={{
                  color: "#aaa",
                  fontFamily: "sans-serif",
                  fontSize: "13px",
                }}
              >
                Loading...
              </p>
            ) : stats.recent_users.length === 0 ? (
              <p
                style={{
                  color: "#aaa",
                  fontFamily: "sans-serif",
                  fontSize: "13px",
                }}
              >
                No data
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {stats.recent_users.map((u) => (
                  <div
                    key={u.id_user}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "#e8f0fe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "#2563a8",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {u.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#1e3a5f",
                          fontFamily: "sans-serif",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {u.full_name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontFamily: "sans-serif",
                        }}
                      >
                        {u.role_name} · {u.created_date}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontFamily: "sans-serif",
                        fontWeight: "600",
                        background:
                          Number(u.status_user) === 1 ? "#d1fae5" : "#fee2e2",
                        color:
                          Number(u.status_user) === 1 ? "#059669" : "#dc2626",
                      }}
                    >
                      {Number(u.status_user) === 1 ? "Active" : "Inactive"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ESS Dashboard (id_role=4) ─────────────────────────────────────────
function ESSDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [pendingLeave, setPendingLeave] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    const fetchAll = async () => {
      try {
        const [profileRes, leaveRes, docRes] = await Promise.all([
          axios.get(`${API_URL}/api/ess_profile/me`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.post(
            `${API_URL}/api/ess_leave/serverside?page=0&size=100`,
            {},
            { headers: { Authorization: `Bearer ${user.token}` } },
          ),
          axios.post(
            `${API_URL}/api/ess_documents/serverside?page=0&size=100`,
            {},
            { headers: { Authorization: `Bearer ${user.token}` } },
          ),
        ]);
        setProfile(profileRes.data);
        setLeaveBalance(leaveRes.data?.current_balance ?? 0);
        setPendingLeave(
          (leaveRes.data?.data || []).filter((l) => l.leave_status === 1)
            .length,
        );
        setDocCount(docRes.data?.total ?? 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.token, API_URL]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const StatCard = ({ title, value, sub, icon, color, bg, link, linkText }) => (
    <div
      onClick={() => router.push(link)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        borderLeft: `5px solid ${color}`,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            color: "#888",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            margin: 0,
            fontFamily: "sans-serif",
          }}
        >
          {title}
        </p>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      <p
        style={{
          fontSize: "40px",
          fontWeight: "800",
          color: "#1e3a5f",
          margin: "0 0 4px",
          lineHeight: 1,
          fontFamily: "sans-serif",
        }}
      >
        {loading ? "—" : value}
      </p>
      <p
        style={{
          color: "#bbb",
          fontSize: "13px",
          margin: "0 0 14px",
          fontFamily: "sans-serif",
        }}
      >
        {sub}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color,
          fontSize: "13px",
          fontFamily: "sans-serif",
        }}
      >
        <span>{linkText}</span>
        <IconArrowRight size={13} />
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fa",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)",
          padding: isMobile ? "28px 20px" : "40px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "100px",
            bottom: "-100px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              margin: "0 0 8px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {today}
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: isMobile ? "22px" : "30px",
              margin: "0 0 8px",
              fontWeight: "700",
            }}
          >
            {greeting()},{" "}
            {profile?.full_name?.split(" ")[0] ||
              user?.name?.split(" ")[0] ||
              "—"}{" "}
            👋
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "13px",
              margin: 0,
              fontFamily: "sans-serif",
            }}
          >
            {profile?.position?.position_name || "—"} &nbsp;·&nbsp;{" "}
            {profile?.departement?.departement_name || "—"} &nbsp;·&nbsp;{" "}
            {profile?.company?.company_name || "—"}
          </p>
        </div>
      </div>

      <div
        style={{
          padding: isMobile ? "20px 16px 32px" : "28px 32px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <StatCard
            title="Leave Balance"
            value={leaveBalance}
            sub="days remaining"
            icon={<IconCalendar size={20} color="#2563a8" />}
            color="#2563a8"
            bg="#e8f0fe"
            link="/ess_leave/list"
            linkText="View leave history"
          />
          <StatCard
            title="Pending Leave"
            value={pendingLeave}
            sub="awaiting approval"
            icon={<IconClock size={20} color="#d97706" />}
            color="#d97706"
            bg="#fef3c7"
            link="/ess_leave/list"
            linkText="Check status"
          />
          <StatCard
            title="My Documents"
            value={docCount}
            sub="files available"
            icon={<IconFolder size={20} color="#059669" />}
            color="#059669"
            bg="#d1fae5"
            link="/ess_documents"
            linkText="View documents"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "#e8f0fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconUser size={18} color="#2563a8" />
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#1e3a5f",
                  fontFamily: "sans-serif",
                }}
              >
                My Profile
              </h3>
            </div>
            {loading ? (
              <p style={{ color: "#aaa", fontFamily: "sans-serif" }}>
                Loading...
              </p>
            ) : (
              <div>
                {[
                  { label: "Badge Number", value: profile?.badge_number },
                  { label: "Company", value: profile?.company?.company_name },
                  {
                    label: "Department",
                    value: profile?.departement?.departement_name,
                  },
                  {
                    label: "Position",
                    value: profile?.position?.position_name,
                  },
                  {
                    label: "Join Date",
                    value: profile?.join_date
                      ? new Date(profile.join_date).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : null,
                  },
                ].map(({ label, value }, i, arr) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom:
                        i < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#9ca3af",
                        fontSize: "13px",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#1e3a5f",
                        fontSize: "13px",
                        fontWeight: "600",
                        fontFamily: "sans-serif",
                        textAlign: "right",
                        maxWidth: "60%",
                      }}
                    >
                      {value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => router.push("/ess_profile")}
              style={{
                marginTop: "18px",
                width: "100%",
                padding: "11px",
                background: "#e8f0fe",
                border: "none",
                borderRadius: "10px",
                color: "#2563a8",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "sans-serif",
              }}
            >
              View Full Profile <IconArrowRight size={14} />
            </button>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: "15px",
                fontWeight: "700",
                color: "#1e3a5f",
                fontFamily: "sans-serif",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {[
                {
                  label: "Apply for Leave",
                  desc: "Submit a new leave request",
                  icon: <IconCalendar size={19} color="#2563a8" />,
                  bg: "#e8f0fe",
                  url: "/ess_leave/create",
                },
                {
                  label: "My Leave History",
                  desc: "View all your leave requests",
                  icon: <IconCheck size={19} color="#059669" />,
                  bg: "#d1fae5",
                  url: "/ess_leave/list",
                },
                {
                  label: "My Documents",
                  desc: "Download your work documents",
                  icon: <IconFolder size={19} color="#d97706" />,
                  bg: "#fef3c7",
                  url: "/ess_documents",
                },
                {
                  label: "View Profile",
                  desc: "Check your personal info",
                  icon: <IconUser size={19} color="#7c3aed" />,
                  bg: "#ede9fe",
                  url: "/ess_profile",
                },
              ].map(({ label, desc, icon, bg, url }) => (
                <div
                  key={label}
                  onClick={() => router.push(url)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                    border: "1px solid #f3f4f6",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f4f8")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f9fafb")
                  }
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1e3a5f",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#9ca3af",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                  <IconArrowRight
                    size={15}
                    color="#d1d5db"
                    style={{ flexShrink: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// - HR Dashboard (id_role= 2) ─────────────────────────────────
function HRDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();
  const router = useRouter();

  // ← Deklarasi role di luar useEffect agar bisa dipakai di fetchAll
  const isHR = Number(user?.id_role) === 2; // tampil semua card
  const isSupervisor = Number(user?.id_role) === 3; // card employee hilang

  const [stats, setStats] = useState({
    totalEmployee: 0,
    activeEmployee: 0,
    inactiveEmployee: 0,
    pendingLeave: 0,
    totalLeave: 0,
    totalMpr: 0,
    pendingMpr: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!user?.token) return;
    const fetchAll = async () => {
      try {
        // ← Hanya fetch employee stats jika id_role = 2
        const empRes = isHR
          ? await axios.get(`${API_URL}/api/user/dashboard`, {
              headers: { Authorization: `Bearer ${user.token}` },
            })
          : null;

        const leaveRes = await axios.post(
          `${API_URL}/api/leave/serverside?allStatus=true&page=0&size=1`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        const leavePendingRes = await axios.post(
          `${API_URL}/api/leave/serverside?status=1&page=0&size=1`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        const recruitmentRes = await axios.post(
          `${API_URL}/api/iss_recruitment/serverside/all?page=0&size=1`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        const mprPendingRes = await axios.post(
          `${API_URL}/api/iss_mpr/serverside/pending?page=0&size=1`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        setStats({
          totalEmployee: empRes?.data?.total ?? 0,
          activeEmployee: empRes?.data?.active ?? 0,
          inactiveEmployee: empRes?.data?.inactive ?? 0,
          pendingLeave: leavePendingRes.data?.total ?? 0,
          totalLeave: leaveRes.data?.total ?? 0,
          totalMpr: recruitmentRes.data?.total ?? 0,
          pendingMpr: mprPendingRes.data?.total ?? 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.token, API_URL]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statCards = [
    // ← Hanya muncul jika id_role = 2
    ...(isHR
      ? [
          {
            title: "Total Employee",
            value: stats.totalEmployee,
            sub: "registered employees",
            icon: <IconUsers size={20} color="#2563a8" />,
            color: "#2563a8",
            bg: "#e8f0fe",
            link: "/employee/list",
            linkText: "View all employees",
          },
          {
            title: "Active Employee",
            value: stats.activeEmployee,
            sub: "currently active",
            icon: <IconUserCheck size={20} color="#059669" />,
            color: "#059669",
            bg: "#d1fae5",
            link: "/employee/list",
            linkText: "View active employees",
          },
          {
            title: "Inactive Employee",
            value: stats.inactiveEmployee,
            sub: "not active",
            icon: <IconUserOff size={20} color="#dc2626" />,
            color: "#dc2626",
            bg: "#fee2e2",
            link: "/employee/check",
            linkText: "View inactive employees",
          },
        ]
      : []),

    // ← Selalu muncul untuk role 2 dan 3
    {
      title: "Total Recruitment",
      value: stats.totalMpr,
      sub: "all recruitment requests",
      icon: <IconClipboardList size={20} color="#7c3aed" />,
      color: "#7c3aed",
      bg: "#ede9fe",
      link: "/iss_recruitment/list/all",
      linkText: "View all recruitment",
    },
    {
      title: isHR ? "Pending Leave" : "Pending Leave",
      value: stats.pendingLeave,
      sub: isHR ? "awaiting approval" : "awaiting approval",
      icon: <IconClock size={20} color="#d97706" />,
      color: "#d97706",
      bg: "#fef3c7",
      link: "/leave_manage/list/pending_approval",
      linkText: isHR ? "Review leave requests" : "Review my assigned requests",
    },
    {
      title: "Pending MPR",
      value: stats.pendingMpr,
      sub: "awaiting approval",
      icon: <IconBriefcase size={20} color="#0891b2" />,
      color: "#0891b2",
      bg: "#cffafe",
      link: "/iss_mpr/list/pending",
      linkText: "Review MPR",
    },
  ];

  const quickLinks = [
    // ← Employee List hanya untuk role 2
    ...(isHR
      ? [
          {
            label: "Employee List",
            desc: "Manage all employees",
            icon: <IconUsers size={19} color="#2563a8" />,
            bg: "#e8f0fe",
            url: "/employee/list",
          },
        ]
      : []),
    {
      label: "Leave Approval",
      desc: "Review pending leave requests",
      icon: <IconCalendar size={19} color="#d97706" />,
      bg: "#fef3c7",
      url: "/leave_manage/list/pending_approval",
    },
    {
      label: "Manpower Request",
      desc: "Review MPR submissions",
      icon: <IconBriefcase size={19} color="#0891b2" />,
      bg: "#cffafe",
      url: "/iss_mpr/list/pending",
    },
    {
      label: "All Leave",
      desc: "View complete leave history",
      icon: <IconClipboardList size={19} color="#7c3aed" />,
      bg: "#ede9fe",
      url: "/leave_manage/list/all",
    },
  ];

  return (
    <div style={{ background: "#f4f7fa", fontFamily: "Georgia, serif" }}>
      {/* HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)",
          padding: isMobile ? "28px 20px" : "40px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "100px",
            bottom: "-100px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "12px",
              margin: "0 0 8px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            {today}
          </p>
          <h1
            style={{
              color: "#fff",
              fontSize: isMobile ? "22px" : "30px",
              margin: "0 0 8px",
              fontWeight: "700",
            }}
          >
            {greeting()}, {user?.name?.split(" ")[0] || "HR Manager"} 👋
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "13px",
              margin: 0,
              fontFamily: "sans-serif",
            }}
          >
            {isHR ? "HR Manager" : "Staff Eksekutif"} · Human Resources
            Management System
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: isMobile ? "20px 16px 32px" : "28px 32px 40px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* STAT CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {statCards.map(
            ({ title, value, sub, icon, color, bg, link, linkText }) => (
              <div
                key={title}
                onClick={() => router.push(link)}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
                  borderLeft: `5px solid ${color}`,
                  cursor: "pointer",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 24px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 16px rgba(0,0,0,0.07)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      color: "#888",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1.5px",
                      margin: 0,
                      fontFamily: "sans-serif",
                    }}
                  >
                    {title}
                  </p>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    color: "#1e3a5f",
                    margin: "0 0 4px",
                    lineHeight: 1,
                    fontFamily: "sans-serif",
                  }}
                >
                  {loading ? "—" : value}
                </p>
                <p
                  style={{
                    color: "#bbb",
                    fontSize: "13px",
                    margin: "0 0 14px",
                    fontFamily: "sans-serif",
                  }}
                >
                  {sub}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    color,
                    fontSize: "13px",
                    fontFamily: "sans-serif",
                  }}
                >
                  <span>{linkText}</span>
                  <IconArrowRight size={13} />
                </div>
              </div>
            ),
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              margin: "0 0 18px",
              fontSize: "15px",
              fontWeight: "700",
              color: "#1e3a5f",
              fontFamily: "sans-serif",
            }}
          >
            Quick Actions
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {quickLinks.map(({ label, desc, icon, bg, url }) => (
              <div
                key={label}
                onClick={() => router.push(url)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f0f4f8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#1e3a5f",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {desc}
                  </p>
                </div>
                <IconArrowRight size={15} color="#d1d5db" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Default Dashboard (role lain) ─────────────────────────────────────
function DefaultDashboard() {
  return (
    <div className="py-12">
      <div className="max-w mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-lg border sm:rounded-lg">
          <div className="p-6 text-gray-900 justify-center text-center font-bold">
            Human Resources Management System
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Index ────────────────────────────────────────────────────────
export default function Index() {
  const { user } = useUser();
  const idRole = Number(user?.id_role);
  const isAdmin = idRole === 1;
  const isHR = [2, 3].includes(idRole);
  const isStaff = idRole === 4;

  const sidebarList = isAdmin
    ? adminOnly
    : isHR
      ? [] // atau hrOnly kalau nanti dipisah
      : isStaff
        ? []
        : undefined;

  return (
    <AuthLayout sidebarList={sidebarList} hideSidebar={true}>
      <Head>
        <title>Home</title>
      </Head>

      {isAdmin ? (
        <AdminDashboard />
      ) : isHR ? (
        <HRDashboard />
      ) : isStaff ? (
        <ESSDashboard />
      ) : (
        <DefaultDashboard />
      )}
    </AuthLayout>
  );
}
