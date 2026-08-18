"use client";

import axiosInstance from "@/utils/apiHelper";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import PortalFooter from "@/components/common/PortalFooter";
import Loading from "@/components/common/Loading";
import useAlertStore from "@/stores/useAlertStore";
import { parseAuthErrorMessage, stripAuthErrorFromUrl } from "@/utils/authErrors";

const FONT = "'DM Sans', sans-serif";

function LoginForm() {
  const searchParams = useSearchParams();
  const { setAlert } = useAlertStore();
  const [isLoading, setIsLoading] = useState(false);
  const handledErrorRef = useRef(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (!errorParam || handledErrorRef.current) return;

    handledErrorRef.current = true;
    setAlert({
      severity: "error",
      message: parseAuthErrorMessage(errorParam),
    });
    stripAuthErrorFromUrl();
  }, [searchParams, setAlert]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/auth/login", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (response.status === 200 && response.data.auth_url) {
        window.location.href = response.data.auth_url;
      }
    } catch (err) {
      setAlert({
        severity: "error",
        message:
          err?.response?.data?.message ||
          "Failed to sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 600,
            color: "rgba(255,255,255,0.95)",
            mb: 1,
            fontFamily: FONT,
          }}
        >
          Sign In
        </Typography>
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 500,
            color: "rgba(255,255,255,0.65)",
            mb: 3.5,
            fontFamily: FONT,
          }}
        >
          Use your Microsoft Account to continue
        </Typography>

        <Box sx={{ mt: 1, mb: 1 }}>
          <Button
            variant="contained"
            onClick={handleLogin}
            disabled={isLoading}
            disableRipple
            sx={{
              position: "relative",
              py: "12px",
              px: 4,
              bgcolor: "#1A56DB",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONT,
              textTransform: "none",
              borderRadius: "11px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#1145B5", boxShadow: "none" },
              "&.Mui-disabled": {
                bgcolor: "#1A56DB",
                color: "#fff",
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                visibility: isLoading ? "hidden" : "visible",
              }}
            >
              Login
            </Box>
            {isLoading && (
              <CircularProgress
                size={20}
                color="inherit"
                sx={{ position: "absolute" }}
              />
            )}
          </Button>
        </Box>
      </Box>
    </>
  );
}

const Page = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0A1C40",
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: "32px 20px", md: "32px 64px", lg: "32px 96px" },
          position: "relative",
          overflow: "hidden",
        }}
      >
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: "50%",
          bgcolor: "rgba(26,86,219,0.14)",
          pointerEvents: "none",
        }}
      />  
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 360,
          height: 360,
          borderRadius: "50%",
          bgcolor: "rgba(26,86,219,0.09)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          bgcolor: "rgba(26,86,219,0.05)",
          pointerEvents: "none",
        }}
      />

      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "stretch",
          borderRadius: "20px",
          width: { xs: "100%", md: 720 },
          maxWidth: "100%",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: "32px 24px", md: "40px 36px" },
            background:
              "linear-gradient(160deg, rgba(255, 255, 255, 0.34) 0%, rgba(236, 241, 250, 0.66) 100%)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: {
              xs: "1px solid rgba(255,255,255,0.12)",
              md: "none",
            },
            borderRight: {
              xs: "none",
              md: "1px solid rgba(255,255,255,0.25)",
            },
          }}
        >
          <Box sx={{ position: "relative", width: 280, height: 180 }}>
            <Image
              src="/images/stewartBrown-logo.svg"
              alt="Stewart Brown logo"
              fill
              sizes="720px"
              priority
              style={{ 
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: "32px 24px", md: "40px 36px" },
          }}
        >
          <Suspense fallback={<Loading />}>
            <LoginForm />
          </Suspense>
        </Box>
      </Box>
      </Box>

      <PortalFooter variant="dark" />
    </Box>
  );
};

export default Page;
