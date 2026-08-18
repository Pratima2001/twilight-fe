"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const SubTabs = () => {
  const [activeTab, setActiveTab] = useState("rates");

  const tabs = [
    {
      id: "rates",
      label: "EA historical rates",
      icon: <TableChartOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
      id: "emp",
      label: "Employee list",
      icon: <GroupsOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
      id: "txn",
      label: "Transactional data",
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 15 }} />,
    },
  ];

  return (
    <Box
      sx={{
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        px: "22px",
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Box
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            sx={{
              px: "20px",
              py: "13px",
              fontSize: "13px",
              cursor: "pointer",
              borderBottom: "2.5px solid",
              borderBottomColor: isActive ? "#2563EB" : "transparent",
              color: isActive ? "#2563EB" : "#6B7280",
              fontWeight: isActive ? 500 : 400,
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all .15s ease",

              "&:hover": {
                color: isActive ? "#2563EB" : "#111827",
              },
            }}
          >
            {tab.icon}

            <Typography
              component="span"
              sx={{
                fontSize: "13px",
                fontWeight: "inherit",
                lineHeight: 1,
              }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default SubTabs;