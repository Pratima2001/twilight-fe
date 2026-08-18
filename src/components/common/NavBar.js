"use client";

import React from "react";
import { useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
} from "@mui/material";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import useAuthStore from "@/stores/useAuthStore";
import { signOut } from "@/utils/authSession";

const getAvatarInitials = (email) => {
  if (!email) return null;
  const name = email.split("@")[0];
  return name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || email[0].toUpperCase();
};

const Navbar = () => {
  const email = useAuthStore((state) => state.email);
  const name = useAuthStore((state) => state.name);
  const currentRole = useAuthStore((state) => state.currentRole);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, []);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "#071638",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        height: 54,
        justifyContent: "center",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "54px !important",
          px: 2.5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Chip
            label="SB"
            size="small"
            sx={{
              bgcolor: "#0A1D47",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: "0.06em",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.12)",
              height: 28,
            }}
          />

          <Box>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Shift worker leave recalculation
            </Typography>

            <Typography
              sx={{
                fontSize: 10,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.2,
              }}
            >
              Stewart Brown
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#1A56DB",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {getAvatarInitials(email) || "JD"}
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.2,
                }}
              >
                {name || "John Doe"}
              </Typography>

              <Typography
                sx={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.2,
                }}
              >
                {currentRole || "User"}
              </Typography>
            </Box>
          </Box>

          <Button
            onClick={handleLogout}
            variant="outlined"
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            sx={{
              color: "rgba(255,255,255,0.6)",
              borderColor: "rgba(255,255,255,0.18)",
              fontSize: 11,
              textTransform: "none",
              borderRadius: "7px",
              px: 1.5,
              py: 0.5,
              minWidth: "auto",

              "&:hover": {
                borderColor: "rgba(255,255,255,0.3)",
                bgcolor: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>

  );
};


export default Navbar;