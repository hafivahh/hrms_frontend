import {
  IconList,
  IconListLetters,
  IconCaretRightFilled ,
  IconFileLambda,
} from "@tabler/icons-react";
export const employee = [
  {
    title: "Employee",
    href: "",
    icon: <IconListLetters size={14} />,
    child: [
      { title: "List", href: "/employee/list", icon: <IconCaretRightFilled size={14} /> },
      {
        title: "Worker Documents",
        href: "/employee/document_worker",
        icon: <IconCaretRightFilled size={14} />,
      },
    ],
  },
  {
    title: "Leave",
    href: "",
    icon: <IconListLetters size={14} />,
    child: [
      {
        title: "List",
        href: "/leave_manage/list/all",
        icon: <IconCaretRightFilled  size={14} />,
      },
      {
        title: "Pending Approval",
        href: "/leave_manage/list/pending_approval",
        icon: <IconCaretRightFilled  size={14} />,
      },
      {
        title: "Completed",
        href: "/leave_manage/list/completed",
        icon: <IconCaretRightFilled  size={14} />,
      },
    ],
  },
{
  title: "MPR",
  href: "",
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Create",
      href: "/iss_mpr/create",
      icon: <IconCaretRightFilled size={14} />,
    },
    {
      title: "List",
      href: "/iss_mpr/list/all",
      icon: <IconCaretRightFilled size={14} />,
    },
    {
      title: "Draft",
      href: "/iss_mpr/list/draft",
      icon: <IconCaretRightFilled size={14} />,
    },
 
    {
      title: "Pending Requestor (End User)",
      href: "/iss_mpr/list/pending_requestor_end_user",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Acknowledge (SM)",
      href: "/iss_mpr/list/pending_acknowledge_sm",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Requestor (CM)",
      href: "/iss_mpr/list/pending_requestor_cm",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Concurred (PMO)",
      href: "/iss_mpr/list/pending_concurred_pmo",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Concurred",
      href: "/iss_mpr/list/pending_concurred",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Concurred (YM)",
      href: "/iss_mpr/list/pending_concurred_ym",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Acknowledge (HR)",
      href: "/iss_mpr/list/pending_acknowledge_hr",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Pending Approval President",
      href: "/iss_mpr/list/pending_approval_president",
      icon: <IconCaretRightFilled  size={14} />,
    },
    {
      title: "Completed",
      href: "/iss_mpr/list/completed",
      icon: <IconCaretRightFilled size={14} />,
    },
    {
      title: "Rejected",
      href: "/iss_mpr/list/rejected",
      icon: <IconCaretRightFilled size={14} />,
    },
  ],
},
];
