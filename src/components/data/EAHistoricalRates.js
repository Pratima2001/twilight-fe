"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Box, Button, TextField, InputAdornment, CircularProgress } from "@mui/material";
import TableSkeleton from "@/components/common/TableSkeleton";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  useDownloadEARatesTemplate,
  useDownloadEARatesMaster,
  useUploadEARatesMaster,
  useViewEARatesMaster,
} from "@/api/hooks/useEARates";
import { downloadFile, getFilenameFromHeaders } from "@/utils/downloadHelper";
import { getPreviewColumnDefs, parseUploadedFile } from "@/utils/fileParser";
import useAlertStore from "@/stores/useAlertStore";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const EAHistoricalRates = () => {
  const { setAlert } = useAlertStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const showAlert = (message, severity = "success") => {
    setAlert({ severity, message });
  };

  // API Hooks
  const downloadTemplateMutation = useDownloadEARatesTemplate();
  const downloadMasterMutation = useDownloadEARatesMaster();
  const uploadMasterMutation = useUploadEARatesMaster();
  const { data: masterData, isLoading, error } = useViewEARatesMaster({
    page,
    page_size: pageSize,
    search: searchText || undefined,
  });
  const [rowData, setRowData] = useState([]);
  const [previewRowData, setPreviewRowData] = useState([]);
  const [previewColumnDefs, setPreviewColumnDefs] = useState([]);

  const gridRef = useRef();
  const fileInputRef = useRef();

  // Update rowData when masterData changes
  useEffect(() => {
    if (masterData?.data?.records) {
      setRowData(masterData.data.records);
    }
  }, [masterData]);

  const columnDefs = useMemo(
    () => [
      { field: "payPeriodEnd", headerName: "Pay period end", flex: 1, minWidth: 120 },
      { field: "employmentType", headerName: "Employment type", flex: 1, minWidth: 140 },
      { field: "positionName", headerName: "Position name", flex: 2, minWidth: 220 },
      { field: "casualRate", headerName: "Casual rate ($/hr)", flex: 1, minWidth: 130 },
      { field: "ordinaryRate", headerName: "Ordinary rate ($/hr)", flex: 1, minWidth: 150 },
      { field: "casualLoading", headerName: "Casual loading %", flex: 1, minWidth: 140 },
      { field: "validFrom", headerName: "Valid from", flex: 1, minWidth: 110 },
      { field: "validTo", headerName: "Valid to", flex: 1, minWidth: 110 },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const displayedRowData = previewRowData.length ? previewRowData : rowData;
  const displayedColumnDefs = previewRowData.length ? previewColumnDefs : columnDefs;

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTemplateMutation.mutateAsync();
      const filename = getFilenameFromHeaders(response.headers, "EA_Rates_Template.xlsx");
      downloadFile(response.data, filename);
      showAlert("Template downloaded successfully");
    } catch (error) {
      showAlert(error.response?.data?.detail?.message || "Failed to download template", "error");
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      try {
        const previewRows = await parseUploadedFile(file);
        setPreviewRowData(previewRows);
        setPreviewColumnDefs(getPreviewColumnDefs(previewRows));
      } catch (parseError) {
        showAlert("Unable to preview uploaded file", "error");
      }

      // Upload with modify action by default
      try {
        const result = await uploadMasterMutation.mutateAsync({
          action: "modify",
          file: file,
        });
        showAlert(result.message || "File uploaded successfully");
        setSelectedFile(null);
        setPreviewRowData([]);
        setPreviewColumnDefs([]);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        showAlert(error.response?.data?.detail?.message || "Failed to upload file", "error");
      }
    }
  };

  const handleDownloadCurrentMaster = async () => {
    try {
      const response = await downloadMasterMutation.mutateAsync();
      const filename = getFilenameFromHeaders(response.headers, "EA_Rates_Master.xlsx");
      downloadFile(response.data, filename);
      showAlert("Master data downloaded successfully");
    } catch (error) {
      showAlert(error.response?.data?.detail?.message || "Failed to download master data", "error");
    }
  };

  const handleModifyMaster = () => {
    showAlert("Modify functionality will be implemented", "info");
  };

  const handleAddNewMaster = () => {
    showAlert("Add functionality will be implemented", "info");
  };

  const onQuickFilterChanged = () => {
    gridRef.current?.api?.setGridOption("quickFilterText", searchText);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2.5, position: "relative" }}>
      {/* Top Bar - Download Template, Choose File, Search */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button
          variant="outlined"
          startIcon={
            downloadTemplateMutation.isPending ? (
              <CircularProgress size={16} />
            ) : (
              <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
            )
          }
          onClick={handleDownloadTemplate}
          disabled={downloadTemplateMutation.isPending}
          sx={{
            textTransform: "none",
            fontSize: 12,
            borderColor: "var(--color-border-light)",
            color: "var(--color-text-primary)",
            borderRadius: "var(--radius-md)",
            py: 0.75,
            px: 2,
            "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" },
          }}
        >
          Download Template
        </Button>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={
              uploadMasterMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <FileUploadOutlinedIcon sx={{ fontSize: 16 }} />
              )
            }
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMasterMutation.isPending}
            sx={{
              textTransform: "none",
              fontSize: 12,
              borderColor: "#D1D5DB",
              color: "#374151",
              py: 0.75,
              px: 2,
              "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
            }}
          >
            Choose File
          </Button>

          <TextField
            size="small"
            placeholder="SEARCH"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onQuickFilterChanged();
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ fontSize: 16, color: "var(--color-text-tertiary)" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: 220,
              "& .MuiOutlinedInput-root": {
              fontSize: 12,
              bgcolor: "var(--color-bg-primary)",
              height: 36,
              },
              "& input::placeholder": {
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.05em",
              },
            }}
          />
        </Box>
      </Box>

      {selectedFile && (
        <Box
          sx={{
            bgcolor: "var(--color-primary-light)",
            border: "1px solid var(--color-border-focus)",
            borderRadius: "var(--radius-sm)",
            p: 1.5,
            fontSize: 12,
            color: "var(--color-info-hover)",
          }}
        >
          Selected file: <strong>{selectedFile.name}</strong>
          {previewRowData.length > 0 && (
            <> — previewing selected file contents in the table.</>
          )}
        </Box>
      )}

      {/* Table Section */}
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
        }}
      >
        {isLoading && !displayedRowData.length ? (
          <TableSkeleton rows={10} />
        ) : (
          <Box
            className="ag-theme-alpine"
            sx={{
              flex: 1,
              width: "100%",
              "& .ag-header": {
                bgcolor: "var(--color-sidebar) !important",
                "--ag-header-background-color": "var(--color-sidebar)",
              },
              "& .ag-header-cell-text": {
                fontSize: 11,
                fontWeight: 500,
                color: "#fff !important",
              },
              "& .ag-header-cell": {
                borderRight: "1px solid rgba(255,255,255,0.08)",
                "&:last-child": { borderRight: "none" },
              },
              "& .ag-cell": {
                fontSize: 12,
                color: "var(--color-text-primary)",
              },
              "& .ag-row": {
                borderBottom: "1px solid var(--color-border-light)",
              },
            }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={displayedRowData}
              columnDefs={displayedColumnDefs}
              defaultColDef={defaultColDef}
              rowHeight={40}
              headerHeight={44}
              pagination={true}
              paginationPageSize={20}
              suppressCellFocus={true}
            />
          </Box>
        )}
      </Box>

      {/* Bottom Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        <Button
          variant="outlined"
          startIcon={
            downloadMasterMutation.isPending ? (
              <CircularProgress size={16} />
            ) : (
              <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
            )
          }
          onClick={handleDownloadCurrentMaster}
          disabled={downloadMasterMutation.isPending}
          sx={{
            textTransform: "none",
            fontSize: 12,
            borderColor: "var(--color-border-light)",
            color: "var(--color-text-primary)",
            borderRadius: "var(--radius-md)",
            py: 0.75,
            px: 2,
            "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" },
          }}
        >
          Current EA Historical Rates
        </Button>
        <Button
          variant="contained"
          startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={handleModifyMaster}
          sx={{
            textTransform: "none",
            fontSize: 12,
            bgcolor: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            py: 0.75,
            px: 2,
            "&:hover": { bgcolor: "var(--color-primary-hover)" },
          }}
        >
          Overrirde EA Historical Rates
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          onClick={handleAddNewMaster}
          sx={{
            textTransform: "none",
            fontSize: 12,
            bgcolor: "var(--color-primary)",
            borderRadius: "var(--radius-md)",
            py: 0.75,
            px: 2,
            "&:hover": { bgcolor: "var(--color-primary-hover)" },
          }}
        >
          Add New EA Rates
        </Button>
      </Box>

      {/* Upload overlay (mutations only — initial load uses skeleton) */}
      {uploadMasterMutation.isPending && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <CircularProgress sx={{ color: "var(--color-primary)" }} />
        </Box>
      )}
    </Box>
  );
};

export default EAHistoricalRates;
