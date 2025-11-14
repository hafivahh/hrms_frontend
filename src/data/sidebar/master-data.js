import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconListLetters, IconMapPinPlus, IconArrowDownToArc, IconDeviceIpadHorizontalPin, IconGps, IconGolf } from "@tabler/icons-react";

export const masterDataList = [
  {
    title: "Form Register",
    href: "",
    active: "Form",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "List",
        href: "/master-data/list",
        active: "Form",
        icon: <IconList size={18} />,
      },
    ],
  },

  {
    title: "Master Data",
    href: "",
    active: "Master",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Area",
        href: "/master-data/area",
        active: "Area",
        icon: <IconGps size={18} />,
      },
      {
        title: "Location",
        href: "/master-data/location",
        active: "Location",
        icon: <IconMapPinPlus size={18} />,
      },
      {
        title: "Point",
        href: "/master-data/point",
        active: "Point",
        icon: <IconGolf size={18} />,
      },
    ],
  },
];
