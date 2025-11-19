import { IconList,IconListLetters, IconDoorExit, IconFileLambda, IconDatabase  } from "@tabler/icons-react";
export const employee= [
  {
    title: "Form Register",
    href: "",
    active: "Form",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "List",
        href: "/employee/employee_list",
        active: "Form",
        icon: <IconList size={18} />,
      },
      // {
      //   title: "Master Departement",
      //   href: "/master_departement/list_departement",
      //   active: "Form",
      //   icon: <IconDatabase size={18} />,
      // },
      // {
      //   title: "Master Project",
      //   href: "/master_project/list_project",
      //   active: "Form",
      //   icon: <IconDatabase size={18} />,
      // },
      // {
      //   title: "Master Role",
      //   href: "/master_role/list_role",
      //   active: "Form",
      //   icon: <IconDatabase size={18} />,
      // },
      // {
      //   title: "Master Leave Type",
      //   href: "/master_leave/list_leave",
      //   active: "Form",
      //   icon: <IconDatabase size={18} />,
      // },
      {
        title: "Leave",
        href: "/employee/leave_list",
        active: "Form",
        icon: <IconDoorExit  size={18} />,
      },
      {
        title: "Worker Documents",
        href: "/employee/document_worker",
        active: "Form",
        icon: <IconFileLambda   size={18} />,
      },
    ],
  },
]