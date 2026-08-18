"use client";

import { Box } from "@mui/material";
import Navbar from "@/components/common/NavBar";
import SideBar from "@/components/common/SideBar";
import PortalFooter from "@/components/common/PortalFooter";

const AppLayout = ({ children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "#EDF0F5",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Navbar />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <SideBar />

        <Box
          component="main"
          sx={{ flex: 1, minHeight: 0, p: "22px 24px", overflow: "auto" }}
        >
          {children}
        </Box>
      </Box>

      <PortalFooter />
    </Box>
  );
};

export default AppLayout;
