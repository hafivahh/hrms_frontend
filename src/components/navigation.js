import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { ActionIcon, Collapse, Menu, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMenu2,
  IconHomeFilled,
  IconUserCog,
  IconUsers,
  IconDatabase,
  IconList,
  IconSettingsPlus,
  IconFolder,
  IconCalendar,
  IconCaretRight,
  IconDoorExit,
  IconNewSection,
  IconUserSearch,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

export default function Navigation({ showToggle = true }) {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const { user } = useUser();

  const permissions = user?.permissions || [];
  const isHR = Number(user?.id_role) === 2;

  const hasPermission = (indexKey) => {
    if (indexKey === null) return true;
    if (isHR) return Number(indexKey) !== 0;
    return permissions.some((p) => Number(p) === Number(indexKey));
  };

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
    {
      name: "ISS",
      icon: <IconUserCog size={20} />,
      indexKey: null,
      child: [
        { title: "Employee", url: "/employee/list", icon: <IconUsers size={18} />, indexKey: 21 },
        { title: "Document Work", url: "/iss_documents/list", icon: <IconFolder size={18} />, indexKey: 29 },
        { title: "Leave", url: "/leave_manage/list/all", icon: <IconDoorExit  size={18} />, indexKey: 22 },
        { title: "MPR", url: "/iss_mpr/list/all", icon: <IconNewSection  size={18} />, indexKey: 23 },
        { title: "Recruitment", url: "/iss_recruitment/list/all", icon: <IconUserSearch  size={18} />, indexKey: 24 },
      ],
    },
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
        { title: "Master Departement", url: "/master/departement/list", icon: <IconDatabase size={18} />, indexKey: 16 },
        { title: "Master Project", url: "/master/project/list", icon: <IconDatabase size={18} />, indexKey: 33 },
        { title: "Master Company", url: "/master/company/list", icon: <IconDatabase size={18} />, indexKey: 37 },
        { title: "Master Position", url: "/master/position/list", icon: <IconDatabase size={18} />, indexKey: 41 },
        { title: "Master Role", url: "/master/role/list", icon: <IconDatabase size={18} />, indexKey: 45 },
        { title: "Master Leave Type", url: "/master/leave/list", icon: <IconDatabase size={18} />, indexKey: 49 },
        { title: "Master Partial Days", url: "/master/partial_days/list", icon: <IconDatabase size={18} />, indexKey: 53 },
      ],
    },
  ];

  // Filter berdasarkan permission
  const filteredNavigation = navigation
    .map((link) => {
      if (link.child) {
        const filteredChildren = link.child.filter((c) => hasPermission(c.indexKey));
        if (filteredChildren.length === 0) return null;
        return { ...link, child: filteredChildren };
      }
      if (!hasPermission(link.indexKey)) return null;
      return link;
    })
    .filter(Boolean);

  const isActive = (url) =>
    url === "/"
      ? router.asPath === "/"
      : router.asPath.startsWith(url);

  // DESKTOP ITEMS
  const desktopItems = filteredNavigation.map((link, index) => {
    if (link.child) {
      return (
        <Menu key={index} shadow="md" position="bottom-start">
          <Menu.Target>
            <div className="text-white p-2 flex items-center cursor-pointer hover:bg-white hover:text-black rounded-md text-sm gap-2">
              {link.icon}
              {link.name}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            {link.child.map((item, idx) => (
              <Link href={item.url} key={idx}>
                <Menu.Item leftSection={item.icon}>
                  {item.title}
                </Menu.Item>
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
        className={`text-white p-2 rounded-md text-sm flex items-center gap-2 hover:bg-white hover:text-black ${
          isActive(link.url) ? "bg-white bg-opacity-25" : ""
        }`}
      >
        {link.icon}
        {link.name}
      </Link>
    );
  });

  return (
    <>
      <nav className="w-full sticky top-0 z-50 flex items-center justify-between bg-sky-700 px-4 py-1">
        {/* Kiri: hamburger + desktop menu */}
        <div className="flex items-center">
         {showToggle && (
  <ActionIcon variant="subtle" size="xl" className="mr-2" onClick={toggleCollapse}>
    <IconMenu2 color="white" />
  </ActionIcon>
)}

          {/* Desktop menu */}
          <div className="hidden md:flex gap-1 items-center">
            {desktopItems}
          </div>
        </div>

        {/* Kanan: hamburger mobile */}
        <div className="md:hidden">
          <ActionIcon variant="subtle" size="xl" onClick={toggle}>
            <IconMenu2 color="white" />
          </ActionIcon>
        </div>
      </nav>

      {/* Mobile Collapse Menu */}
      <Collapse in={opened} className="md:hidden sticky top-12 z-50">
        <nav className="w-full flex flex-col bg-sky-700 px-4 py-1">
          {filteredNavigation.map((link, index) => (
            <div key={index} className="text-white">
              <NavLink
                component={link.url ? Link : "div"}
                href={link.url || "#"}
                label={link.name}
                leftSection={link.icon}
                variant="subtle"
                active={link.url ? isActive(link.url) : false}
                childrenOffset={28}
                styles={{
                  root: { color: "white", borderRadius: "6px" },
                  label: { color: "white" },
                }}
              >
                {link.child?.map((child, idx) => (
                  <NavLink
                    key={idx}
                    component={Link}
                    href={child.url}
                    label={child.title}
                    leftSection={child.icon}
                    variant="subtle"
                    active={isActive(child.url)}
                    styles={{
                      root: { color: "white", borderRadius: "6px" },
                      label: { color: "white" },
                    }}
                  />
                ))}
              </NavLink>
            </div>
          ))}
        </nav>
      </Collapse>
    </>
  );
}