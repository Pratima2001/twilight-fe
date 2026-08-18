"use client";

import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { AgGridReact } from "@ag-grid-community/react";
import TableSkeleton from "@/components/common/TableSkeleton";
import AgGridInfo from "@/components/common/AgGridInfo";
import AgGridPagination from "@/components/common/AgGridPagination";
import { masterGridSx, defaultMasterColDef } from "./masterGridConfig";

const MasterDataGrid = ({
  gridRef,
  isPreviewMode,
  isParsing,
  isLoading,
  rowData,
  previewRowData,
  columnDefs,
  previewColumnDefs,
  previewRowCount,
  selectedFile,
  searchText,
  page,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
  defaultColDef = defaultMasterColDef,
}) => {
  const activeColumnDefs = isPreviewMode ? previewColumnDefs : columnDefs;
  const activeRowData = isPreviewMode ? previewRowData : rowData;
  const showInitialSkeleton =
    !isPreviewMode && isLoading && !activeRowData?.length;
  const showParsingOverlay = isPreviewMode && isParsing && !previewRowData.length;

  useEffect(() => {
    gridRef.current?.api?.setGridOption("quickFilterText", searchText || "");
  }, [gridRef, searchText]);

  return (
    <Box
      sx={{
        bgcolor: "var(--color-bg-primary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-light)",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {selectedFile && (
        <Box
          sx={{
            bgcolor: "var(--color-primary-light)",
            borderBottom: "1px solid var(--color-border-focus)",
            px: 2,
            py: 1.25,
            fontSize: 12,
            color: "var(--color-info-hover)",
            flexShrink: 0,
          }}
        >
          Selected file: <strong>{selectedFile.name}</strong>
          {isParsing ? (
            <> - parsing file for preview…</>
          ) : previewRowCount > 0 ? (
            <> - previewing {previewRowCount.toLocaleString()} row(s) from the selected file.</>
          ) : (
            <> - no data rows found in the selected file.</>
          )}
        </Box>
      )}

      {(showInitialSkeleton || showParsingOverlay ) ? (
        <TableSkeleton rows={10} />
      ) : (
        <>
          <Box
            className="ag-theme-alpine"
            sx={masterGridSx}
          >
            <AgGridReact
              ref={gridRef}
              rowData={activeRowData}
              columnDefs={activeColumnDefs}
              defaultColDef={defaultColDef}
              rowHeight={40}
              headerHeight={44}
              suppressCellFocus
              suppressPaginationPanel
              animateRows={false}
              rowBuffer={20}
              debounceVerticalScrollbar
              getRowId={(params) => {
                if (params.data?.__previewRowId != null) {
                  return `preview-${params.data.__previewRowId}`;
                }
                return (
                  params.data?.id ??
                  `${params.data?.employee_id ?? "row"}-${params.data?.pay_code ?? ""}-${params.rowIndex}`
                );
              }}
            />
          </Box>

          {!isPreviewMode && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "var(--color-bg-primary)",
                borderTop: "1px solid var(--color-border-light)",
                px: 2,
                py: 1.5,
                flexShrink: 0,
              }}
            >
              <AgGridInfo
                currentPage={page}
                rowsPerPage={pageSize}
                totalRows={totalRecords}
              />
              <AgGridPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
                pageSize={pageSize}
                onPageSizeChange={onPageSizeChange}
                isLoading={isLoading}
              />
            </Box>
          )}

          {/* {isPreviewMode && !isParsing && previewRowCount > 0 && (
            <Box
              sx={{
                borderTop: "1px solid var(--color-border-light)",
                px: 2,
                py: 1.5,
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                Previewing{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {previewRowCount.toLocaleString()}
                </Box>{" "}
                rows - scroll to load more virtually.
              </Typography>
            </Box>
          )} */}
        </>
      )}

      {/* {showParsingOverlay && (
        <Box
          // sx={{
          //   position: "absolute",
          //   inset: 0,
          //   bgcolor: "rgba(255, 255, 255, 0.65)",
          //   display: "flex",
          //   alignItems: "center",
          //   justifyContent: "center",
          //   zIndex: 2,
          // }}
        >
          <TableSkeleton rows={10} />
        </Box>
      )} */}
    </Box>
  );
};

export default MasterDataGrid;
