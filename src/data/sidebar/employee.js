import {
  IconList,
  IconListLetters,
  IconDoorExit,
  IconFileLambda,
  IconDatabase,
} from "@tabler/icons-react";
export const employee = [
  {
    title: "Employee",
    href: "",
    icon: <IconListLetters size={18} />,
    child: [
      { title: "List", href: "/employee/list", icon: <IconList size={18} /> },
      {
        title: "Worker Documents",
        href: "/employee/document_worker",
        icon: <IconFileLambda size={18} />,
      },
    ],
  },
  {
    title: "Leave",
    href: "",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "List",
        href: "/leave_manage/list/all",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "Pending Approval",
        href: "/leave_manage/list/pending_approval",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "Completed",
        href: "/leave_manage/list/completed",
        icon: <IconDoorExit size={18} />,
      },
    ],
  },
  {
    title: "MPR",
    href: "",
    icon: <IconListLetters size={18} />,
    child: [
       {
        title: "Create",
        href: "/iss_mpr/create",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "List",
        href: "/iss_mpr/list/all",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "Pending Approval",
        href: "/iss_mpr/list/pending_approval",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "Completed",
        href: "/iss_mpr/list/completed",
        icon: <IconDoorExit size={18} />,
      },
    ],
  },
];
