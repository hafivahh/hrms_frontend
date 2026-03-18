// components/layout/Sidebar.jsx

import { cn } from "@/lib/utils";
import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { NavLink } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function Sidebar({ className, sidebarList }) {
  const { sidebarCollapsed } = useCollapseStore();
  const path = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const permissions = user?.permissions || [];
  const isHR = Number(user?.id_role) === 2;
  const isAdmin = Number(user?.id_role) === 1;

  // ← Filter sidebar item berdasarkan indexKey
  const hasPermission = (indexKey) => {
    if (indexKey === null || indexKey === undefined) return true; // selalu tampil
       // HR lihat semua (kecuali admin, sudah handle di navigation)
    return permissions.some((p) => Number(p) === Number(indexKey));
  };

  // Filter sidebarList berdasarkan permission
  const filteredList = (sidebarList || [])
    .map((item) => {
      // Cek permission item parent
      if (!hasPermission(item.indexKey)) return null;

      // Filter child jika ada
      if (item.child && item.child.length > 0) {
        const filteredChildren = item.child.filter((c) =>
          hasPermission(c.indexKey ?? item.indexKey)
        );
        if (filteredChildren.length === 0) return null;
        return { ...item, child: filteredChildren };
      }

      return item;
    })
    .filter(Boolean);

  return (
    <aside
      className={cn(
        `bg-sky-900 h-full left-0 md:h-auto top-0 z-40 transition-[width] md:bottom-0 md:right-auto ${
          sidebarCollapsed ? "md:w-0 w-0" : "md:w-64 w-80"
        }`,
        className,
      )}
    >
      {sidebarCollapsed
        ? null
        : filteredList.map((item, index) => (
            <NavLink
              key={index}
              onClick={() =>
                router.push(
                  item.child && item.child.length > 0 ? "#" : item.href,
                )
              }
              label={item.title}
              leftSection={item.icon}
              variant="filled"
              color="cyan"
              active={item.href === path}
              childrenOffset={28}
              style={{ color: "white" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              {item.child &&
                item.child.length > 0 &&
                item.child.map((child, idx) => (
                  <NavLink
                    key={idx}
                    onClick={() => router.push(child.href)}
                    label={child.title}
                    leftSection={child.icon}
                    variant="filled"
                    color="cyan"
                    active={child.href === path}
                    childrenOffset={28}
                    bg="bg-slate-800"
                    style={{ color: "white" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "black")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  />
                ))}
            </NavLink>
          ))}
    </aside>
  );
}
