import { IconListLetters, IconDatabase } from "@tabler/icons-react";
export const master_data = [
  {
    title: "Master Data",
    href: "",
    active: "Form",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Master Departement",
        href: "/master/departement/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Master",
        href: "/master/departement/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Project",
        href: "/master/project/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Master",
        href: "/master/project/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
       {
        title: "Master Company",
        href: "/master/company/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Master",
        href: "/master/company/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Position",
        href: "/master/position/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
       {
        title: "Create Master",
        href: "/master/position/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Role",
        href: "/master/role/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Master",
        href: "/master/role/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Leave Type",
        href: "/master/leave_manage/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Leave Type",
        href: "/master/leave_manage/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
    ],
  },
];
