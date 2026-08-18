"use client";

import { Box } from "@mui/material";
import Loading from "./Loading";

/**
 * LoadingWrapper - Displays loading state while data is being fetched
 * 
 * @param {boolean} isLoading - Whether data is currently loading
 * @param {React.ReactNode} children - Content to display when not loading
 * @param {string} minHeight - Minimum height for the wrapper (default: "200px")
 * 
 * @example
 * <LoadingWrapper isLoading={isLoadingData}>
 *   <YourComponent data={data} />
 * </LoadingWrapper>
 */
export default function LoadingWrapper({ 
  isLoading, 
  children, 
  minHeight = "200px" 
}) {
  if (isLoading) {
    return (
      <Box sx={{ position: "relative", minHeight, width: "100%" }}>
        <Loading />
      </Box>
    );
  }

  return <>{children}</>;
}
