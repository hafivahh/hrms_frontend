import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import { Button, Image, Menu } from "@mantine/core";
import {
  IconUser,
  IconLogout,
  IconChevronDown,
  IconKey,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function Header() {
  const { user, logout } = useUser();
  const { encrypt } = useEncrypt();
  const router = useRouter();
  const API = useApi();
  const LINK_PORTAL = API.LINK_PORTAL;

  const handleLogout = () => {
    Cookies.remove("portal_login_token");
    Cookies.remove("portal_login_name");
    Cookies.remove("portal_login_id");
    Cookies.remove("portal_user");
    logout();
    router.replace("/login");
    window.location.reload();
  };

  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8">
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/hrms.png`}
          w={200}
          alt="logo"
        />
      </div>

      <div className="flex items-center gap-2">
        <Menu shadow="md" width={200} position="bottom-end">
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
              leftSection={<IconUserCircle size={16} />}
              onClick={() => {
                router.push("/ess_profile"); 
              }}
            >
              Profile
            </Menu.Item>

            <Menu.Item
              leftSection={<IconKey size={16} />}
              onClick={() => {
                const encryptedId = encrypt(String(user?.id));
                router.push(`/portal/user_control/${encryptedId}`);
              }}
            >
              Change Password
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconLogout size={16} />}
              color="red"
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
}
