"use client";

import { Box, Link, Typography } from "@mui/material";

const PROCESSX_URL = "https://www.process-x.com.au/";

/**
 * PortalFooter — subtle attribution bar for authenticated and public portal shells.
 *
 * @param {"default" | "dark"} variant — "dark" for login/marketing backgrounds
 */
const PortalFooter = ({ variant = "default" }) => {
  const isDark = variant === "dark";

  return (
    <Box
      component="footer"
      role="contentinfo"
      sx={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 1,
        px: 2,
        borderTop: isDark ? "none" : "1px solid var(--color-border)",
        bgcolor: isDark ? "transparent" : "var(--color-bg-primary)",
      }}
    >
      <Typography
        component="p"
        sx={{
          m: 0,
          fontSize: "var(--font-size-sm)",
          color: isDark ? "rgba(255,255,255,0.45)" : "var(--color-text-tertiary)",
          fontFamily: "var(--font-primary)",
          lineHeight: 1.5,
        }}
      >
        Powered by{" "}
        <Link
          href={PROCESSX_URL}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          aria-label="ProcessX — opens in a new tab"
          sx={{
            color: isDark ? "rgba(255,255,255,0.72)" : "var(--color-primary)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-base)",
            "&:hover": {
              color: isDark ? "#fff" : "var(--color-primary-hover)",
            },
          }}
        >
          ProcessX
        </Link>
      </Typography>
    </Box>
  );
};

export default PortalFooter;
