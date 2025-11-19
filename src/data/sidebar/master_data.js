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
        title: "Create Master Departement",
        href: "/master_departement/create",
        active: "Form",
        icon: <IconDatabase size={18} />,
      },
    ],
  },
]
