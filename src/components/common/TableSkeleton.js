"use client";

import { Box, Divider, Skeleton, Stack } from "@mui/material";

const TableSkeleton = ({ rows = 10, headerHeight = 40 }) => {
  return (
    <Box sx={{ width: "100%", px: 0 }}>
      {/* Header row */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={headerHeight}
        sx={{ bgcolor: "var(--color-sidebar)", opacity: 0.15, borderRadius: 0 }}
      />

      <Box py={0.5}>
        <Divider sx={{ borderColor: "var(--color-border-light)" }} />
      </Box>

      {/* Body rows */}
      <Stack spacing={0.75} sx={{ px: 1.5, py: 0.75 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            height={32}
            sx={{ borderRadius: "var(--radius-sm)", transform: "none" }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TableSkeleton;
