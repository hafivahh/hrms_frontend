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
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";


const COOKIE_EXPIRE_TIME = 86400;

const PUBLIC_PAGES = ["/login", "/career", "/career/detail"];

const ROUTE_PERMISSION_MAP = [
  { path: "/portal", indexKey: 0 },
  { path: "/employee", indexKey: 21 },
  { path: "/iss_documents", indexKey: 29 },
  { path: "/leave_manage", indexKey: 22 },
  { path: "/iss_mpr", indexKey: 23 },
  { path: "/iss_recruitment", indexKey: 24 },
  { path: "/ess_leave", indexKey: 19 },
  { path: "/ess_documents", indexKey: 18 },
  { path: "/master/departement", indexKey: 16 },
  { path: "/master/project", indexKey: 33 },
  { path: "/master/company", indexKey: 37 },
  { path: "/master/position", indexKey: 41 },
  { path: "/master/role", indexKey: 45 },
  { path: "/master/leave", indexKey: 49 },
  { path: "/master/partial_days", indexKey: 53 },
  { path: "/change_password", indexKey: null },
];

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

      const isPublicPage = PUBLIC_PAGES.some((page) =>
        router.pathname.startsWith(page),
      );

      if (isPublicPage) {
        setIsAuthenticated(true);
        return;
      }

      const { auth_user } = router.query;

      // FLOW 1 — SSO via query param
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

      // FLOW 2 — Login biasa via token cookie
      const loginToken = Cookies.get("portal_login_token");
      if (loginToken) {
        try {
          const res = await axios.post(
            `${API_URL}/api/auth/refresh-permissions`,
            {},
            { headers: { Authorization: `Bearer ${loginToken}` } },
          );

          setUser({
            token: loginToken,
            name: Cookies.get("portal_login_name") || "",
            id: Cookies.get("portal_login_id") || "",
            id_user: Cookies.get("portal_login_id") || "",
            id_role: res.data?.id_role ?? null,
            permissions: res.data?.permissions ?? [],
          });
        } catch {
          setUser({
            token: loginToken,
            name: Cookies.get("portal_login_name") || "",
            id: Cookies.get("portal_login_id") || "",
            id_user: Cookies.get("portal_login_id") || "",
            id_role: Cookies.get("portal_login_role") || null,
            permissions: [],
          });
        }
        setIsAuthenticated(true);
        return;
      }

      // FLOW 3 — SSO via portal_user cookie
      const cookieValue = Cookies.get("portal_user");
      if (!cookieValue) {
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
  // PERMISSION GUARD
  // ===============================
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const isPublicPage = PUBLIC_PAGES.some((page) =>
      router.pathname.startsWith(page),
    );
    if (isPublicPage) return;
    if (router.pathname === "/") return;

    const isHR = Number(user?.id_role) === 2;
    const permissions = user?.permissions || [];

    const hasPermission = (indexKey) => {
      if (indexKey === null) return true;
      if (isHR) return Number(indexKey) !== 0;
      return permissions.some((p) => Number(p) === Number(indexKey));
    };

    const matched = ROUTE_PERMISSION_MAP.find((r) =>
      router.pathname.startsWith(r.path),
    );

    if (matched && !hasPermission(matched.indexKey)) {
      router.replace("/");
    }
  }, [isAuthenticated, router.pathname, user]);

  // ===============================
  // RENDER
  // ===============================
  return (
  <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}>
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
  </GoogleReCaptchaProvider>
);
}
