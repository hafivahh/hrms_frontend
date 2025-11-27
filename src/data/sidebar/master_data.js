import {IconListLetters, IconDatabase } from "@tabler/icons-react";
export const master_data = [
  {
    title: "Master Data",
    href: "",
    active: "Form",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Master Departement",
        href: "/master_departement/list_departement",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Master",
        href: "/master_departement/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Project",
        href: "/master_project/list_project",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
       {
        title: "Create Master",
        href: "/master_project/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Role",
        href: "/master_role/list_role",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Master Leave Type",
        href: "/master_leave/list_leave",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
      {
        title: "Create Leave Type",
        href: "/master_leave/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
    ],
  },
]
