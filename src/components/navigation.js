import useCollapseStore from "@/store/useLayout";
import { ActionIcon, Collapse, Menu, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMenu2,
  IconHomeFilled,
  IconUserCog,
  IconDatabase,
  IconUsers,
  IconList,
  IconSettingsPlus,
  IconFolder,
  IconCalendar,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import useUser from "@/store/useUser";

export default function Navigation() {
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const path = usePathname();
  const { user } = useUser();

  const permissions = user?.permissions || [];
  const isHR = Number(user?.id_role) === 2;
  const isDashboard = path === "/";

  // ✅ Permission logic
  const hasPermission = (indexKey) => {
    if (indexKey === null) return true;

    // HR tidak boleh akses Administrator
    if (isHR) return Number(indexKey) !== 50;

    return permissions.some((p) => Number(p) === Number(indexKey));
  };

  // ✅ SATU NAVIGATION UNTUK SEMUA ROLE
  const navigation = [
    {
      name: "Dashboard",
      url: "/",
      icon: <IconHomeFilled size={20} />,
      indexKey: null,
    },
    {
      name: "Administrator",
      url: "/portal/user",
      icon: <IconSettingsPlus size={20} />,
      indexKey: 50,
    },
    {
      name: "ISS",
      icon: <IconUserCog size={20} />,
      indexKey: null,
      child: [
        {
          title: "Employee",
          url: "/employee/dashboard",
          icon: <IconUserCog size={18} />,
          indexKey: 45,
        },
        {
          title: "Document Work",
          url: "/iss_documents/dashboard",
          icon: <IconUserCog size={18} />,
          indexKey: 46,
        },
        {
          title: "Leave",
          url: "/leave_manage/list/all",
          icon: <IconList size={18} />,
          indexKey: 47,
        },
        {
          title: "MPR",
          url: "/iss_mpr/dashboard",
          icon: <IconList size={18} />,
          indexKey: 48,
        },
        {
          title: "Recruitment",
          url: "/iss_recruitment/dashboard",
          icon: <IconList size={14} />,
          indexKey: 49,
        },
      ],
    },
    {
      name: "ESS",
      icon: <IconUsers size={20} />,
      indexKey: null,
      child: [
        {
          title: "Profile",
          url: "/ess_profile",
          icon: <IconUsers size={18} />,
          indexKey: 52,
        },
        {
          title: "Leave Request",
          url: "/ess_leave/list",
          icon: <IconCalendar size={18} />,
          indexKey: 53,
        },
        {
          title: "Documents",
          url: "/ess_documents",
          icon: <IconFolder size={18} />,
          indexKey: 54,
        },
      ],
    },
    {
      name: "Master Data",
      icon: <IconDatabase size={20} />,
      indexKey: 51,
      child: [
        {
          title: "Master Departement",
          url: "/master/departement/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
        {
          title: "Master Project",
          url: "/master/project/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
        {
          title: "Master Company",
          url: "/master/company/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
        {
          title: "Master Position",
          url: "/master/position/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
        {
          title: "Master Role",
          url: "/master/role/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
        {
          title: "Master Leave Type",
          url: "/master/leave/list",
          icon: <IconDatabase size={18} />,
          indexKey: 51,
        },
      ],
    },
  ];

  // ✅ FILTER PERMISSION
 const isStaff = Number(user?.id_role) === 4;

const filteredNavigation = navigation
  .map((link) => {
    // ❌ HIDE ESS UNTUK STAFF
    if (isStaff && link.name === "ESS") return null;

    if (link.child) {
      const filteredChildren = link.child.filter((c) =>
        hasPermission(c.indexKey)
      );
      if (filteredChildren.length === 0) return null;
      return { ...link, child: filteredChildren };
    }

    if (!hasPermission(link.indexKey)) return null;
    return link;
  })
  .filter(Boolean);

  // ✅ DESKTOP
  const desktopItems = filteredNavigation.map((link, index) => {
    if (link.child) {
      return (
        <Menu key={index} shadow="md" position="bottom-start">
          <Menu.Target>
            <div className="w-fit text-white p-2 flex items-center cursor-pointer hover:bg-white hover:text-black rounded-md text-sm">
              <div className="mr-2">{link.icon}</div>
              {link.name}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            {link.child.map((item, idx) => (
              <Link href={item.url} key={idx}>
                <Menu.Item icon={item.icon}>{item.title}</Menu.Item>
              </Link>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Link
        key={index}
        href={link.url}
        className={`w-fit text-white p-2 rounded-md text-sm flex items-center hover:bg-white hover:text-black ${
          path === link.url ? "bg-white bg-opacity-25 text-white" : ""
        }`}
      >
        <div className="mr-2">{link.icon}</div>
        {link.name}
      </Link>
    );
  });

  // ✅ MOBILE
  const mobileItems = filteredNavigation.map((link, index) => (
    <div key={index} className="text-white">
      {link.child ? (
        <NavLink
          label={link.name}
          leftSection={link.icon}
          variant="subtle"
          childrenOffset={40}
        >
          {link.child.map((child, idx) => (
            <NavLink
              key={idx}
              component={Link}
              href={child.url}
              label={child.title}
              variant="subtle"
            />
          ))}
        </NavLink>
      ) : (
        <NavLink
          component={Link}
          href={link.url}
          label={link.name}
          leftSection={link.icon}
          variant="subtle"
        />
      )}
    </div>
  ));

  return (
    <>
      {/* DESKTOP */}
      <nav className="w-full sticky top-0 z-50 md:flex items-center justify-between bg-sky-700 px-4 py-2 hidden">
        <div className="flex items-center gap-2">
          {!isDashboard && (
            <ActionIcon variant="subtle" size="xl" onClick={toggleCollapse}>
              <IconMenu2 color="white" />
            </ActionIcon>
          )}
          <div className="flex gap-1 items-center">{desktopItems}</div>
        </div>
      </nav>

      {/* MOBILE */}
      <nav className="md:hidden w-full flex items-center justify-between bg-sky-700 px-4 py-2 sticky top-0 z-50">
        {!isDashboard && (
          <ActionIcon variant="subtle" size="xl" onClick={toggleCollapse}>
            <IconMenu2 color="white" />
          </ActionIcon>
        )}
        <ActionIcon variant="subtle" size="xl" onClick={toggle}>
          <IconMenu2 color="white" />
        </ActionIcon>
      </nav>

      <Collapse in={opened} className="md:hidden w-full bg-sky-700">
        <nav className="flex flex-col px-4 py-2">{mobileItems}</nav>
      </Collapse>
    </>
  );
}