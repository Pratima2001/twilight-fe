"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { getDefaultLandingPageForRole } from "@/components/common/SideBar";
import Loading from "@/components/common/Loading";

const PUBLIC_ROUTES = ["/", "/login", "/auth/login", "/auth/microsoft/callback"];
const AUTH_CALLBACK_ROUTE = "/auth/microsoft/callback";

export default function AuthProvider({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const currentRoleId = useAuthStore((state) => state.currentRoleId);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthCallback = pathname === AUTH_CALLBACK_ROUTE;
  const lastRedirectRef = useRef(null);

  const redirectTo = (() => {
    if (!hasHydrated) return null;
    if (!user && !isPublicRoute) return "/auth/login";
    if (user && currentRoleId && isPublicRoute && !isAuthCallback) {
      return getDefaultLandingPageForRole(currentRoleId);
    }
    return null;
  })();

  useEffect(() => {
    if (!redirectTo) return;

    const redirectKey = `${pathname}:${redirectTo}`;
    if (lastRedirectRef.current === redirectKey) return;

    lastRedirectRef.current = redirectKey;
    router.replace(redirectTo);
  }, [redirectTo, pathname, router]);

  if (!hasHydrated) {
    return <Loading />;
  }

  if (redirectTo) {
    return <Loading />;
  }

  return children;
}
