import { useEffect, useState } from "react";
import { useCookie } from "../hooks/useCookie";
import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import useDecrypt from "@/hooks/useDecrypt";
import Cookies from "js-cookie";
import axios from "axios";
import Head from "next/head";
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import useApi from "@/hooks/useApi";
import { usePathname } from "next/navigation";

const COOKIE_EXPIRE_TIME = 86400;

// Halaman yang tidak perlu auth
const PUBLIC_PAGES = ['/login'];

export default function App({ Component, pageProps }) {
  const cookieUser = useCookie("portal_user");
  const { user, setUser } = useUser();
  const router = useRouter();
  const { decrypt } = useDecrypt();
  const pathname = usePathname();
  const API = useApi();
  const API_URL = API.API_URL;
  const PORTAL_API = API.LINK_PORTAL;

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ===============================
  // VALIDATE VIA SSO (encrypted id)
  // ===============================
  const validateUser = async (userId) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/validate`, {
        id_user: userId,
      });
      if (data.success) return data;
    } catch (error) {
      console.error("Error validating user (SSO):", error);
      return null;
    }
  };

  // ===============================
  // INIT AUTH
  // ===============================
  useEffect(() => {
    const initAuth = async () => {
      if (!router.isReady) return;

      // ⬅️ Skip auth untuk halaman public (login, dll)
      if (PUBLIC_PAGES.includes(router.pathname)) {
        
        setIsAuthenticated(true);
        return;
      }

      const { auth_user } = router.query;

      // ===============================
      // FLOW 1 — SSO via query param auth_user
      // ===============================
      if (auth_user) {
        const isValidUser = await validateUser(auth_user);

        if (isValidUser) {
          Cookies.set("portal_user", auth_user, {
            expires: COOKIE_EXPIRE_TIME / 86400,
          });

          setUser({
            id: auth_user,
            name: isValidUser.user?.full_name || "",
            badge_number: isValidUser.user?.badge_number || "",
            token: isValidUser.token,
          });

          setIsAuthenticated(true);
          router.replace(pathname);
        } else {
          router.push(`${PORTAL_API}`);
        }
        return;
      }

      // ===============================
      // FLOW 2 — Login biasa via token cookie
      // ===============================
      const loginToken = Cookies.get("portal_login_token");
      if (loginToken) {
        setUser({
          token: loginToken,
          name: Cookies.get("portal_login_name") || "",
          id: Cookies.get("portal_login_id") || "",
        });
        setIsAuthenticated(true);
        return;
      }

      // ===============================
      // FLOW 3 — SSO via portal_user cookie
      // ===============================
      const cookieValue = Cookies.get("portal_user");
      if (!cookieValue) {
        // Tidak ada session apapun — ke halaman login
        router.push("/login");
        return;
      }

      const isValidUser = await validateUser(cookieValue);
      if (isValidUser) {
        setUser({
          id: cookieValue,
          name: isValidUser.user?.full_name || "",
          badge_number: isValidUser.user?.badge_number || "",
          token: isValidUser.token,
        });
        setIsAuthenticated(true);
      } else {
        Cookies.remove("portal_user");
        router.push("/login");
      }
    };

    initAuth();
  }, [router.isReady, router.query, cookieUser]);

  // ===============================
  // RENDER
  // ===============================
  return (
    <MantineProvider>
      {!isAuthenticated ? (
        <>
          <Head>
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
          </Head>
          <LoadingOverlay visible={true} />
        </>
      ) : (
        <>
          <Head>
            <title>
              {Component.title ? `${Component.title} - ` : ""}
              {process.env.NEXT_PUBLIC_APP_NAME}
            </title>
          </Head>
          <Component {...pageProps} />
        </>
      )}
    </MantineProvider>
  );
}