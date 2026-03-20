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
        indexKey: 16,
      },
     
      {
        title: "Master Project",
        href: "/master/project/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 33,
      },
      
      {
        title: "Master Company",
        href: "/master/company/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 37,

      },
      
      {
        title: "Master Position",
        href: "/master/position/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 41,
      },
     
      {
        title: "Master Role",
        href: "/master/role/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 45,
      },
     
      {
        title: "Master Leave Type",
        href: "/master/leave_manage/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 49,
      },
      {
        title: "Master Partial Days",
        href: "/master/partial_days/list",
        active: "Form",
        icon: <IconDatabase size={18} />,
        indexKey: 53,
      },
      
    ],
  },
];
