// @/data/sidebar/employee.js

import {
  IconList,
  IconListLetters,
  IconCaretRightFilled,
  IconFileLambda,
} from "@tabler/icons-react";

export const adminOnly = [
  {
    title: "Administrator",
    href: "",
    icon: <IconListLetters size={14} />,
    child: [
      {
        title: "User List",
        href: "/portal/user",
        icon: <IconCaretRightFilled size={14} />,
      },
      {
        title: "Control Permission",
        href: "/permission/application",
        icon: <IconCaretRightFilled size={14} />,
      },
    ],
  },
];

// ─── EMPLOYEE ────────────────────────────────────────────────────────
const employeeMenu = {
  title: "Employee",
  href: "",
  indexKey: 21,          // ← Menu Employee
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Dashboard",
      href: "/employee/dashboard",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 1,
    },
    {
      title: "List",
      href: "/employee/list",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 21,
    },
    {
      title: "Check Employee",
      href: "/employee/check",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 6,
    },
  ],
};

// ─── DOCUMENT WORK ───────────────────────────────────────────────────
const documentMenu = {
  title: "Document Work",
  href: "",
  indexKey: 29,          // ← Menu Document Work
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Dashboard",
      href: "/iss_documents/dashboard",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 28,
    },
    {
      title: "List Documents",
      href: "/iss_documents/list",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 29,
    },
    {
      title: "Upload Worker Documents",
      href: "/iss_documents/upload",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 30,
    },
  ],
};

// ─── LEAVE ───────────────────────────────────────────────────────────
const leaveMenu = {
  title: "Leave",
  href: "",
  indexKey: 22,          // ← Menu Leave
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Dashboard",
      href: "/leave_manage/dashboard",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 31,
    },
    {
      title: "List",
      href: "/leave_manage/list/all",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 22,
    },
    {
      title: "Pending Approval",
      href: "/leave_manage/list/pending_approval",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 22,
    },
    {
      title: "Completed",
      href: "/leave_manage/list/completed",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 22,
    },
  ],
};

// ─── MPR ─────────────────────────────────────────────────────────────
const mprMenu = {
  title: "MPR",
  href: "",
  indexKey: 23,          // ← Menu MPR
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Dashboard",
      href: "/iss_mpr/dashboard",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 10,
    },
    {
      title: "Create",
      href: "/iss_mpr/create",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 11,
    },
    {
      title: "List",
      href: "/iss_mpr/list/all",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Draft",
      href: "/iss_mpr/list/draft",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Pending Requestor (End User)",
      href: "/iss_mpr/list/pending_requestor_end_user",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Pending Acknowledge (SM)",
      href: "/iss_mpr/list/pending_acknowledge_sm",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Pending Acknowledge (HM)",
      href: "/iss_mpr/list/pending_acknowledge_hm",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Pending Approval President",
      href: "/iss_mpr/list/pending_approval_president",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    // {
    //   title: "Pending Concurred",
    //   href: "/iss_mpr/list/pending_concurred",
    //   icon: <IconCaretRightFilled size={14} />,
    //   indexKey: 23,
    // },
    // {
    //   title: "Pending Concurred (YM)",
    //   href: "/iss_mpr/list/pending_concurred_ym",
    //   icon: <IconCaretRightFilled size={14} />,
    //   indexKey: 23,
    // },
    // {
    //   title: "Pending Acknowledge (HR)",
    //   href: "/iss_mpr/list/pending_acknowledge_hr",
    //   icon: <IconCaretRightFilled size={14} />,
    //   indexKey: 23,
    // },
    // {
    //   title: "Pending Approval President",
    //   href: "/iss_mpr/list/pending_approval_president",
    //   icon: <IconCaretRightFilled size={14} />,
    //   indexKey: 23,
    // },
    {
      title: "Completed",
      href: "/iss_mpr/list/completed",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
    {
      title: "Rejected",
      href: "/iss_mpr/list/rejected",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 23,
    },
  ],
};

// ─── RECRUITMENT ─────────────────────────────────────────────────────
const recruitmentMenu = {
  title: "Recruitment",
  href: "",
  indexKey: 24,          // ← Menu Recruitment
  icon: <IconListLetters size={14} />,
  child: [
    {
      title: "Dashboard",
      href: "/iss_recruitment/dashboard",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 15,
    },
    {
      title: "All",
      href: "/iss_recruitment/list/all",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 24,
    },
    {
      title: "Open",
      href: "/iss_recruitment/list/open",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 24,
    },
    {
      title: "Fulfillment in Progress",
      href: "/iss_recruitment/list/fulfillment",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 24,
    },
    {
      title: "Closed",
      href: "/iss_recruitment/list/closed",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 24,
    },
    {
      title: "Cancel",
      href: "/iss_recruitment/list/cancel",
      icon: <IconCaretRightFilled size={14} />,
      indexKey: 24,
    },
  ],
};

// ─── EXPORTS ─────────────────────────────────────────────────────────
export const employee = [
  employeeMenu,
  leaveMenu,
  mprMenu,
  recruitmentMenu,
  documentMenu,
];

export const employeeOnly    = [employeeMenu];
export const DocumentOnly    = [documentMenu];
export const leaveOnly       = [leaveMenu];
export const mprOnly         = [mprMenu];
export const recruitmentOnly = [recruitmentMenu];