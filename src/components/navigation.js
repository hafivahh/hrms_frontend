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
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const permissions = user?.permissions || [];
  const isHR = Number(user?.id_role) === 2;
  const isDashboard = path === "/";

  const hasPermission = (indexKey) => {
    if (indexKey === null) return true;
    if (isHR) return Number(indexKey) !== 0;
    return permissions.some((p) => Number(p) === Number(indexKey));
  };

  // NAVIGATION (SEMUA ROLE SAMA)
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
      indexKey: 0,
    },

    // ISS tetap dropdown
    {
      name: "ISS",
      icon: <IconUserCog size={20} />,
      indexKey: null,
      child: [
        {
          title: "Employee",
          url: "/employee/list",
          icon: <IconUserCog size={18} />,
          indexKey: 21,
        },
        {
          title: "Document Work",
          url: "/iss_documents/list",
          icon: <IconUserCog size={18} />,
          indexKey: 29,
        },
        {
          title: "Leave",
          url: "/leave_manage/list/all",
          icon: <IconList size={18} />,
          indexKey: 22,
        },
        {
          title: "MPR",
          url: "/iss_mpr/list/all",
          icon: <IconList size={18} />,
          indexKey: 23,
        },
        {
          title: "Recruitment",
          url: "/iss_recruitment/list/all",
          icon: <IconList size={14} />,
          indexKey: 24,
        },
      ],
    },

    //  ESS jadi FLAT (tidak dropdown lagi)
    {
      name: "Leave Request",
      url: "/ess_leave/list",
      icon: <IconCalendar size={20} />,
      indexKey: 19,
    },
    {
      name: "Documents",
      url: "/ess_documents",
      icon: <IconFolder size={20} />,
      indexKey: 18,
    },

    {
      name: "Master Data",
      icon: <IconDatabase size={20} />,
      indexKey: null,
      child: [
        {
          title: "Master Departement",
          url: "/master/departement/list",
          icon: <IconDatabase size={18} />,
          indexKey: 16,
        },
        {
          title: "Master Project",
          url: "/master/project/list",
          icon: <IconDatabase size={18} />,
          indexKey: 33,
        },
        {
          title: "Master Company",
          url: "/master/company/list",
          icon: <IconDatabase size={18} />,
          indexKey: 37,
        },
        {
          title: "Master Position",
          url: "/master/position/list",
          icon: <IconDatabase size={18} />,
          indexKey: 41,
        },
        {
          title: "Master Role",
          url: "/master/role/list",
          icon: <IconDatabase size={18} />,
          indexKey: 45,
        },
        {
          title: "Master Leave Type",
          url: "/master/leave/list",
          icon: <IconDatabase size={18} />,
          indexKey: 49,
        },
        {
          title: "Master Partial Days",
          url: "/master/partial_days/list",
          icon: <IconDatabase size={18} />,
          indexKey: 53,
        },
      ],
    },
  ];

  //  FILTER PERMISSION
  const filteredNavigation = navigation
    .map((link) => {
      if (link.child) {
        const filteredChildren = link.child.filter((c) =>
          hasPermission(c.indexKey),
        );
        if (filteredChildren.length === 0) return null;
        return { ...link, child: filteredChildren };
      }

      if (!hasPermission(link.indexKey)) return null;
      return link;
    })
    .filter(Boolean);

  //  DESKTOP
  const desktopItems = filteredNavigation.map((link, index) => {
    if (link.child) {
      return (
        <Menu key={index} shadow="md" position="bottom-start">
          <Menu.Target>
            <div className="text-white p-2 flex items-center cursor-pointer hover:bg-white hover:text-black rounded-md text-sm">
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
        className={`text-white p-2 rounded-md text-sm flex items-center hover:bg-white hover:text-black ${
          path === link.url ? "bg-white bg-opacity-25" : ""
        }`}
      >
        <div className="mr-2">{link.icon}</div>
        {link.name}
      </Link>
    );
  });

  return (
    <nav className="w-full sticky top-0 z-50 flex items-center bg-sky-700 px-4 py-2">
      {!isDashboard && (
        <ActionIcon variant="subtle" size="xl" onClick={toggleCollapse}>
          <IconMenu2 color="white" />
        </ActionIcon>
      )}

      <div className="flex gap-1 items-center overflow-x-auto scrollbar-hide flex-1 min-w-0">
        {desktopItems}
      </div>
    </nav>
  );
}
