import {
  IconList,
  IconListLetters,
  IconDoorExit,
  IconFileLambda,
} from "@tabler/icons-react";
export const ess = [
//   {
//     title: "Employee",
//     href: "",
//     icon: <IconListLetters size={18} />,
//     child: [
//       { title: "List", href: "/ess_/list", icon: <IconList size={18} /> },
//       {
//         title: "Worker Documents",
//         href: "/ess_/document_worker",
//         icon: <IconFileLambda size={18} />,
//       },
//     ],
//   },
  {
    title: "Attandance",
    href: "",
    icon: <IconListLetters size={18} />,
    child: [
      { title: "List", href: "/ess_/list", icon: <IconList size={18} /> },
      {
        title: "Worker Documents",
        href: "/ess_/document_worker",
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
        title: "List Leave",
        href: "/ess_leave/list",
        icon: <IconDoorExit size={18} />,
      },
      {
        title: "Request Leave",
        href: "/leave_manage/list/draft",
        icon: <IconDoorExit size={18} />,
      },
    ],
  },
];
