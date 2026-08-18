"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Tab, Tabs } from "@mui/material";
import AppLayout from "@/components/layouts/AppLayout";
import EmploymentStatus from "@/components/data/EmploymentStatus";
import EmployeeList from "@/components/data/EmployeeList";
import TransactionalData from "@/components/data/TransactionalData";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";

const MASTER_TABS = [
  { id: 0, label: "Employment status", icon: DescriptionOutlinedIcon, Component: EmploymentStatus },
  { id: 1, label: "Employee list", icon: PeopleOutlinedIcon, Component: EmployeeList },
  { id: 2, label: "Transactional data", icon: StorageOutlinedIcon, Component: TransactionalData },
];

const tabPanelSx = (isActive) => ({
  display: isActive ? "flex" : "none",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
});

const Page = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [mountedTabs, setMountedTabs] = useState({ 0: true });

  useEffect(() => {
    setMountedTabs((prev) => (prev[activeTab] ? prev : { ...prev, [activeTab]: true }));
  }, [activeTab]);

  return (
    <AppLayout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography
          component="h1"
          sx={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", mb: 2.5 }}
        >
          Data Management
        </Typography>

        <Box
          sx={{
            bgcolor: "var(--color-bg-primary)",
            border: "1px solid var(--color-border-light)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: 2,
              flexShrink: 0,
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 48,
                fontSize: 13,
                fontWeight: 400,
                color: "var(--color-text-secondary)",
                gap: 1,
                "&.Mui-selected": {
                  color: "var(--color-primary)",
                  fontWeight: 500,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--color-primary)",
              },
            }}
          >
            {MASTER_TABS.map(({ id, label, icon: Icon }) => (
              <Tab
                key={id}
                icon={<Icon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={label}
              />
            ))}
          </Tabs>

          <Box sx={{ flex: 1, overflow: "hidden", p: 3 }}>
            {MASTER_TABS.map(({ id, Component }) =>
              mountedTabs[id] ? (
                <Box key={id} sx={tabPanelSx(activeTab === id)}>
                  <Component isActive={activeTab === id} />
                </Box>
              ) : null
            )}
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
};

export default Page;
