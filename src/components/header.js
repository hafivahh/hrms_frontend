import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Image, Menu } from "@mantine/core";
import { IconUser, IconLogout, IconChevronDown } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();
  const API = useApi();
  const LINK_PORTAL = API.LINK_PORTAL;

  const handleLogout = () => {
  // Hapus semua cookie
  Cookies.remove("portal_login_token");
  Cookies.remove("portal_login_name");
  Cookies.remove("portal_login_id");
  Cookies.remove("portal_user");

  logout(); // clear Zustand
  router.push("/login");
};

  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8">
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logo_white.png`}
          w={200}
          alt="logo"
        />
      </div>

      <div className="flex items-center">
        {/* 👤 User Dropdown */}
        <Menu shadow="md" width={180} position="bottom-end">
          <Menu.Target>
            <Button
              variant="filled"
              rightSection={<IconChevronDown size={16} />}
              leftSection={<IconUser size={20} />}
            >
              {user?.name}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconLogout size={16} />}
              color="red"
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Button
          component={Link}
          href={LINK_PORTAL}
          variant="filled"
          color="red"
          size="sx"
        >
          Portal
        </Button>
      </div>
    </header>
  );
}
