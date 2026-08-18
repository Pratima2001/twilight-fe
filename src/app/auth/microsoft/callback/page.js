"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/common/Loading";
import { getDefaultLandingPageForRole } from "@/components/common/SideBar";
import useAuthStore from "@/stores/useAuthStore";
import axiosInstance from "@/utils/apiHelper";
import { getAuthFailureMessage, parseAuthErrorMessage } from "@/utils/authErrors";
import { redirectToLogin } from "@/utils/authSession";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const handledRef = useRef(false);
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const authenticate = async () => {
      const urlError = searchParams.get("error");
      if (urlError) {
        await redirectToLogin(parseAuthErrorMessage(urlError));
        return;
      }

      try {
        const response = await axiosInstance.get("/auth/me", {
          skipAuthRedirect: true,
        });
        const user = response.data?.data;

        if (!user) {
          throw new Error("No user data returned");
        }

        setUser(user);

        const roleId = useAuthStore.getState().currentRoleId;
        const destination = roleId
          ? getDefaultLandingPageForRole(roleId)
          : "/auth/login";

        window.location.replace(destination);
      } catch (error) {
        await redirectToLogin(getAuthFailureMessage(error, error?.response?.status));
      }
    };

    authenticate();
  }, [searchParams, setUser]);

  return <Loading />;
}

export default function MicrosoftCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CallbackHandler />
    </Suspense>
  );
}
