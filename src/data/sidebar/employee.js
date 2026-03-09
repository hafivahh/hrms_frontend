import {
  IconList,
  IconListLetters,
  IconCaretRightFilled,
  IconFileLambda,
} from "@tabler/icons-react";

// ⬅️ tambah di bawah export yang sudah ada
export const adminOnly = [
  {
    title: "Administrator",
    href: "",
    icon: <IconListLetters size={14} />,
    child: [
      { title: "User List", href: "/portal/user", icon: <IconCaretRightFilled size={14} /> },
      { title: "Create User", href: "/portal/create", icon: <IconCaretRightFilled size={14} /> },
    ],
  },
];

const employeeMenu = {
  title: "Employee",
  href: "",
  icon: <IconListLetters size={14} />,
  child: [
    { title: "List", href: "/employee/list", icon: <IconCaretRightFilled size={14} /> },
    { title: "List Documents", href: "/iss_documents/list", icon: <IconCaretRightFilled size={14} /> },
    { title: "Worker Documents", href: "/iss_documents/create", icon: <IconCaretRightFilled size={14} /> },
  ],
};

const leaveMenu = {
  title: "Leave",
  href: "",
  icon: <IconListLetters size={14} />,
  child: [
    { title: "List", href: "/leave_manage/list/all", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Approval", href: "/leave_manage/list/pending_approval", icon: <IconCaretRightFilled size={14} /> },
    { title: "Completed", href: "/leave_manage/list/completed", icon: <IconCaretRightFilled size={14} /> },
  ],
};

const mprMenu = {
  title: "MPR",
  href: "",
  icon: <IconListLetters size={14} />,
  child: [
    { title: "Create", href: "/iss_mpr/create", icon: <IconCaretRightFilled size={14} /> },
    { title: "List", href: "/iss_mpr/list/all", icon: <IconCaretRightFilled size={14} /> },
    { title: "Draft", href: "/iss_mpr/list/draft", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Requestor (End User)", href: "/iss_mpr/list/pending_requestor_end_user", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Acknowledge (SM)", href: "/iss_mpr/list/pending_acknowledge_sm", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Requestor (CM)", href: "/iss_mpr/list/pending_requestor_cm", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Concurred (PMO)", href: "/iss_mpr/list/pending_concurred_pmo", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Concurred", href: "/iss_mpr/list/pending_concurred", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Concurred (YM)", href: "/iss_mpr/list/pending_concurred_ym", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Acknowledge (HR)", href: "/iss_mpr/list/pending_acknowledge_hr", icon: <IconCaretRightFilled size={14} /> },
    { title: "Pending Approval President", href: "/iss_mpr/list/pending_approval_president", icon: <IconCaretRightFilled size={14} /> },
    { title: "Completed", href: "/iss_mpr/list/completed", icon: <IconCaretRightFilled size={14} /> },
    { title: "Rejected", href: "/iss_mpr/list/rejected", icon: <IconCaretRightFilled size={14} /> },
  ],
};

const recruitmentMenu = {
  title: "Recruitment",
  href: "",
  icon: <IconListLetters size={14} />,
  child: [
    { title: "All", href: "/iss_recruitment/list/all", icon: <IconCaretRightFilled size={14} /> },
    { title: "Open", href: "/iss_recruitment/list/open", icon: <IconCaretRightFilled size={14} /> },
    { title: "Fulfillment in Progress", href: "/iss_recruitment/list/fulfillment", icon: <IconCaretRightFilled size={14} /> },
    { title: "Closed", href: "/iss_recruitment/list/closed", icon: <IconCaretRightFilled size={14} /> },
    { title: "Cancel", href: "/iss_recruitment/list/cancel", icon: <IconCaretRightFilled size={14} /> },
  ],

  
};

export const employee = [employeeMenu, leaveMenu, mprMenu, recruitmentMenu];

export const employeeOnly = [employeeMenu];
export const leaveOnly = [leaveMenu];
export const mprOnly = [mprMenu];
export const recruitmentOnly = [recruitmentMenu];