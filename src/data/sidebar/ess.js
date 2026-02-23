import {
  IconList,
  IconListLetters,
  IconCaretRightFilled ,
  IconFileLambda,
} from "@tabler/icons-react";
export const ess = [
  {
    title: "ESS",
    href: "",
    icon: <IconListLetters size={14} />,
    child: [
      { title: "Work Document", href: "/ess_documents", icon: <IconCaretRightFilled size={14} /> },
     
      {
        title: "Profile",
        href: "/ess_profile",
        icon: <IconCaretRightFilled size={14} />,
      },
       {
        title: "Leave",
        href: "/ess_leave/list",
        icon: <IconCaretRightFilled size={14} />,
      },
    ],
  },
];
