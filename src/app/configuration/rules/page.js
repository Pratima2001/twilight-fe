"use client";

import { Box } from "@mui/material";
import AppLayout from "@/components/layouts/AppLayout";
import RuleConfiguration from "@/components/rule_configuration/RuleConfiguration";

const Page = () => {
  return (
    <AppLayout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <RuleConfiguration />
      </Box>
    </AppLayout>
  );
};

export default Page;
