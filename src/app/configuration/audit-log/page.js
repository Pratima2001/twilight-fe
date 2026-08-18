"use client";

import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import AppLayout from "@/components/layouts/AppLayout";
import RuleChangeLog from "@/components/rule_configuration/RuleChangeLog";
import { useGetAuditLogs } from "@/api/hooks/useAuditLog";

const Page = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useGetAuditLogs({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const records = data?.records ?? [];
  const pagination = data?.pagination ?? { total_count: 0, page: 1, page_size: 20, total_pages: 1 };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPage(1);
  };

  return (
    <AppLayout>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Page header */}
        <Box sx={{ flexShrink: 0, mb: 2 }}>
          <Typography
            component="h1"
            sx={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}
          >
            Audit log
          </Typography>
        </Box>

        {/* RuleChangeLog fills remaining height */}
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <RuleChangeLog
            auditLogs={records}
            isLoading={isLoading}
            pagination={pagination}
            search={search}
            onSearchChange={setSearch}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>
      </Box>
    </AppLayout>
  );
};

export default Page;
