import { IconList,IconListLetters, IconDoorExit, IconFileLambda, IconDatabase  } from "@tabler/icons-react";
export const employee= [
  {
    title: "Employee",
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