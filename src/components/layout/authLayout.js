import React from "react";
import Header from "../header";
import Navigation from "../navigation";
import Footer from "../footer";
import Sidebar from "../sidebar";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children, sidebarList = [] }) {
  const path = usePathname();

  // ======================================
  // 1) Normalize "child" to always be array
  // ======================================
  let finalSidebar = sidebarList.map((menu) => ({
    ...menu,
    child: Array.isArray(menu.child) ? menu.child : [],
  }));

  // ======================================
  // 2) MASTER DATA FILTER (existing logic)
  // ======================================
  const isMasterRoute = path.startsWith("/master/");

  if (isMasterRoute) {
    const currentModule = path.split("/")[2];

    finalSidebar = finalSidebar.map((menu) => {
      const isMasterMenu = menu.child.some((c) =>
        c.href.startsWith("/master/")
      );

      if (!isMasterMenu) return menu;

      const filteredChild = menu.child.filter((child) => {
        const moduleFromHref = child.href.split("/")[2];
        return moduleFromHref === currentModule;
      });

      return { ...menu, child: filteredChild };
    });
  }

  // ======================================
  // 3) ISS MODULE FILTER
  // /employee/* → show only employee menu
  // ======================================
  const isEmployeeRoute = path.startsWith("/employee/");

  if (isEmployeeRoute) {
    finalSidebar = finalSidebar
      .map((menu) => {
        if (menu.title !== "Employee") return null;
        return menu;
      })
      .filter(Boolean);
  }

  // ======================================
  // 4) LEAVE MODULE FILTER
  // /leave_manage/* → show only Leave menu
  // ======================================
  const isLeaveRoute = path.startsWith("/leave_manage/");

  if (isLeaveRoute) {
    finalSidebar = finalSidebar
      .map((menu) => {
        if (menu.title !== "Leave") return null;
        return menu;
      })
      .filter(Boolean);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />

      <div className="relative flex flex-grow">
        <Sidebar
          className="absolute md:relative overflow-y-auto"
          sidebarList={finalSidebar}
        />
        <main id="content" className="flex-1 overflow-auto px-5 md:px-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
