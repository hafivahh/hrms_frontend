import React from "react";
import Header from "../header";
import Navigation from "../navigation";
import Footer from "../footer";
import Sidebar from "../sidebar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";   // ⬅ Tambah ini

export default function AuthLayout({ children, sidebarList }) {
  const router = useRouter();

  // ============================
  // FILTER SIDEBAR BERDASARKAN URL
  // ============================
  const filteredSidebar = sidebarList?.map((menu) => {
    const filteredChild = menu.child?.filter((item) =>
      router.pathname.startsWith("/" + item.href.split("/")[1])
    );

    return {
      ...menu,
      child: filteredChild ?? [],
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <Navigation />

      <div className="relative flex flex-grow">
        {filteredSidebar && filteredSidebar.length > 0 && (
          <Sidebar
            className={cn(`absolute md:relative overflow-y-auto`)}
            sidebarList={filteredSidebar}
          />
        )}

        <main id="content" className="flex-1 z-0 overflow-auto px-5 md:px-0">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
