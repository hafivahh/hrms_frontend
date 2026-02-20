import useCollapseStore from "@/store/useLayout";
import { ActionIcon, Collapse, Menu, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconMenu2,
  IconHomeFilled,
  IconUserCog,
  IconAccessible,
  IconDatabase,
  IconUsers,
  IconList,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";

const navigation = [
  {
    name: "Dashboard",
    url: "/",
    icon: <IconHomeFilled size={20} />,
    permission: 1,
  },
  {
    name: "ISS",
    icon: <IconUserCog size={20} />,
    permission: 1,
    child: [
      {
        title: "Employee",
        url: "/employee/list",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Leave",
        url: "/leave_manage/list/all",
        icon: <IconList size={18} />,
      },
      {
        title: "MPR",
        url: "/iss_mpr/list/all",
        icon: <IconList size={18} />,
      },
      {
      title: "Create",
      url: "/iss_mpr/create",
      icon: <IconList size={14} />,
    },
    ],
  },
  {
    name: "ESS",
    icon: <IconUsers size={20} />,
    permission: 1,
    child: [
      {
        title: "Profile",
        url: "/ess_profile",
        icon: <IconUsers size={18} />,
      },
      {
        title: "Leave Request",
        url: "/ess_leave/list",
        icon: <IconList size={18} />,
      },
      {
        title: "Documents",
        url: "/ess_documents",
        icon: <IconList size={18} />,
      },
        {
        title: "Attendance",
        url: "/pss/attendance",
        icon: <IconAccessible size={18} />,
      },
    ],
  },
  {
    name: "PSS",
    icon: <IconAccessible size={20} />,
    permission: 1,
    child: [
      {
        title: "Dashboard",
        url: "/pss_recruitment",
        icon: <IconAccessible size={18} />,
      },
    ],
  },
  {
    name: "Master Data",
    icon: <IconDatabase size={20} />,
    permission: 1,
    child: [
      {
        title: "Master Departement",
        url: "/master/departement/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Project",
        url: "/master/project/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Company",
        url: "/master/company/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Position",
        url: "/master/position/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Job Title",
        url: "/master/job_title/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Role",
        url: "/master/role/list",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Leave Type",
        url: "/master/leave/list",
        icon: <IconDatabase size={18} />,
      },
    ],
  },
];

export default function Navigation() {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const path = usePathname();

  // Render desktop menu
  const desktopItems = navigation.map((link, index) => {
    if (link.child) {
      // Parent menu with dropdown
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
              <Menu.Item key={idx} icon={item.icon}>
                <Link href={item.url}>{item.title}</Link>
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    // Normal single link
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

  // Render mobile menu
  const mobileItems = navigation.map((link, index) => (
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
      {/* Desktop & tablet navbar */}
      <nav className="w-full sticky top-0 z-50 md:flex items-center justify-between bg-blue-600 px-4 py-2 hidden md:flex">
        <div className="flex items-center gap-2">
          <ActionIcon variant="subtle" size="xl" onClick={toggleCollapse}>
            <IconMenu2 color="white" />
          </ActionIcon>
          <div className="flex gap-1 items-center">{desktopItems}</div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden w-full flex items-center justify-between bg-blue-600 px-4 py-2 sticky top-0 z-50">
        <ActionIcon variant="subtle" size="xl" onClick={toggleCollapse}>
          <IconMenu2 color="white" />
        </ActionIcon>
        <ActionIcon variant="subtle" size="xl" onClick={toggle}>
          <IconMenu2 color="white" />
        </ActionIcon>
      </nav>

      {/* Mobile menu collapse */}
      <Collapse in={opened} className="md:hidden w-full bg-blue-600">
        <nav className="flex flex-col px-4 py-2">{mobileItems}</nav>
      </Collapse>
    </>
  );
}
