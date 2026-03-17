import React from "react";
import Header from "../header";
import Navigation from "../navigation";
import Footer from "../footer";
import Sidebar from "../sidebar";
import { usePathname } from "next/navigation";
import useUser from "@/store/useUser";


export default function AuthLayout({ children, sidebarList = [], hideSidebar = false }) {
  const path = usePathname();
  const { user } = useUser();

  // role 4 = Staff → tidak pakai sidebar
  const isStaff = Number(user?.id_role) === 4;

  let finalSidebar = sidebarList.map((menu) => ({
    ...menu,
    child: Array.isArray(menu.child) ? menu.child : [],
  }));

  const isMasterRoute = path.startsWith("/master/");
  if (isMasterRoute) {
    const currentModule = path.split("/")[2];
    finalSidebar = finalSidebar.map((menu) => {
      const isMasterMenu = menu.child.some((c) => c.href.startsWith("/master/"));
      if (!isMasterMenu) return menu;
      const filteredChild = menu.child.filter((child) => {
        const moduleFromHref = child.href.split("/")[2];
        return moduleFromHref === currentModule;
      });
      return { ...menu, child: filteredChild };
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navigation />

      <div className="relative flex flex-grow">
       {!hideSidebar && (
  <Sidebar
    className="absolute md:relative overflow-y-auto"
    sidebarList={finalSidebar}
  />
)}
        <main id="content" className="flex-1 overflow-auto px-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}