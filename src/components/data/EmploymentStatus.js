"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Box, Button, TextField, InputAdornment, Chip, CircularProgress } from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import {
  useDownloadEARatesTemplate,
  useDownloadEARatesMaster,
  useUploadEARatesMaster,
  useViewEARatesMaster,
} from "@/api/hooks/useES";
import { downloadFile, getFilenameFromHeaders } from "@/utils/downloadHelper";
import { useMasterFilePreview } from "@/hooks/useMasterFilePreview";
import MasterDataGrid from "@/components/data/MasterDataGrid";
import { ADD_DATA_TOOLTIP, MODIFY_DATA_TOOLTIP } from "@/components/data/masterDataTooltips";
import MasterDataActionTooltipButton from "@/components/data/MasterDataActionTooltipButton";
import MasterDataOverrideConfirmDialog from "@/components/data/MasterDataOverrideConfirmDialog";
import useAlertStore from "@/stores/useAlertStore";
import { buildUploadErrorAlert } from "@/utils/uploadErrorAlert";
import { useDebounce } from "@/hooks/useDebounce";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const EMPLOYMENT_STATUS_COLUMNS = {
  employee_id: "Employee ID",
  cost_centre: "Cost Centre",
  position_name: "Position Name",
  hired_date: "Hired Date",
  term_date: "Term Date",
  status: "Status",
};

const EXPECTED_HEADERS = Object.values(EMPLOYMENT_STATUS_COLUMNS);

const EmploymentStatus = ({ isActive = true }) => {
  const { setAlert } = useAlertStore();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const gridRef = useRef(null);

  const showAlert = (message, severity = "success") => {
    setAlert({ severity, message });
  };

  const {
    selectedFile,
    isPreviewMode,
    previewColumnDefs,
    previewRowData,
    previewRowCount,
    isParsing,
    fileInputRef,
    handleFileSelect,
    resetFileStates,
  } = useMasterFilePreview({
    expectedHeaders: EXPECTED_HEADERS,
    onError: (message) => showAlert(message, "error"),
  });

  const downloadTemplateMutation = useDownloadEARatesTemplate();
  const downloadMasterMutation = useDownloadEARatesMaster();
  const uploadMasterMutation = useUploadEARatesMaster();
  const { data: masterData, isLoading } = useViewEARatesMaster(
    {
      page,
      page_size: pageSize,
      search: debouncedSearchText || undefined,
    },
    isActive && !isPreviewMode
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText]);

  const pagination = masterData?.data?.pagination || {};
  const records = masterData?.data?.records || [];
  const totalRecords = pagination.total_count || 0;
  const totalPages = pagination.total_pages || 1;

  const columnDefs = useMemo(
    () => [
      { field: "employee_id", headerName: EMPLOYMENT_STATUS_COLUMNS.employee_id, flex: 1, minWidth: 140 },
      { field: "cost_centre", headerName: EMPLOYMENT_STATUS_COLUMNS.cost_centre, flex: 1, minWidth: 140 },
      { field: "position_name", headerName: EMPLOYMENT_STATUS_COLUMNS.position_name, flex: 2, minWidth: 200 },
      { field: "hired_date", headerName: EMPLOYMENT_STATUS_COLUMNS.hired_date, flex: 1, minWidth: 120 },
      { field: "term_date", headerName: EMPLOYMENT_STATUS_COLUMNS.term_date, flex: 1, minWidth: 120 },
      {
        field: "status",
        headerName: EMPLOYMENT_STATUS_COLUMNS.status,
        flex: 1,
        minWidth: 120,
        cellRenderer: (params) => (
          <Chip
            label={params.value}
            size="small"
            sx={{ fontSize: 10, height: 20, bgcolor: "var(--color-primary-light)", color: "var(--color-info-hover)", fontWeight: 500 }}
          />
        ),
      },
    ],
    []
  );

  const handleClearFile = () => {
    resetFileStates();
    setSearchText("");
    showAlert("File cleared", "info");
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTemplateMutation.mutateAsync();
      const filename = getFilenameFromHeaders(response.headers, "Employment_Status_Template.xlsx");
      downloadFile(response.data, filename);
      showAlert("Template downloaded successfully");
    } catch (error) {
      showAlert(error.response?.data?.detail?.message || "Failed to download template", "error");
    }
  };

  const handleDownloadCurrentMaster = async () => {
    try {
      const response = await downloadMasterMutation.mutateAsync();
      const filename = getFilenameFromHeaders(response.headers, "Employment_Status_Master.xlsx");
      downloadFile(response.data, filename);
      showAlert("Master data downloaded successfully");
    } catch (error) {
      showAlert(error.response?.data?.detail?.message || "Failed to download master data", "error");
    }
  };

  const handleOverrideClick = () => {
    if (!selectedFile) {
      showAlert("Please choose a file before modifying", "warning");
      return;
    }
    setOverrideModalOpen(true);
  };

  const handleConfirmModify = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadMasterMutation.mutateAsync({ action: "modify", file: selectedFile });
      showAlert(result?.message || "File uploaded successfully");
      resetFileStates();
      setSearchText("");
      setOverrideModalOpen(false);
    } catch (error) {
      resetFileStates();
      setAlert(buildUploadErrorAlert(error));
      setOverrideModalOpen(false);
    }
  };

  const handleAddNewMaster = () => {
    if (!selectedFile) {
      showAlert("Please choose a file before adding", "warning");
      return;
    }

    (async () => {
      try {
        const result = await uploadMasterMutation.mutateAsync({ action: "append", file: selectedFile });
        showAlert(result?.message || "File uploaded successfully");
        resetFileStates();
        setSearchText("");
      } catch (error) {
        resetFileStates();
        setAlert(buildUploadErrorAlert(error));
      }
    })();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2.5, position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
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
          sx={{ textTransform: "none", fontSize: 12, borderColor: "var(--color-border-light)", color: "var(--color-text-primary)", borderRadius: "var(--radius-md)", py: 0.75, px: 2, "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" } }}
        >
          Download Template
        </Button>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleFileSelect} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              variant="outlined"
              startIcon={uploadMasterMutation.isPending || isParsing ? <CircularProgress size={16} /> : <FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMasterMutation.isPending || isParsing}
              sx={{ textTransform: "none", fontSize: 12, borderColor: "var(--color-border-light)", color: "var(--color-text-primary)", borderRadius: "var(--radius-md)", py: 0.75, px: 2, "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" } }}
            >
              Choose File
            </Button>
            {selectedFile && (
              <Button size="small" variant="text" color="error" title="Remove File" onClick={handleClearFile} sx={{ minWidth: "auto", p: 0.5 }}>
                ✕
              </Button>
            )}
          </Box>

          <TextField
            size="small"
            placeholder="SEARCH"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ fontSize: 16, color: "var(--color-text-tertiary)" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 220, "& .MuiOutlinedInput-root": { fontSize: 12, bgcolor: "var(--color-bg-primary)", height: 36 } }}
          />
        </Box>
      </Box>

      <MasterDataGrid
        gridRef={gridRef}
        isPreviewMode={isPreviewMode}
        isParsing={isParsing}
        isLoading={isLoading}
        rowData={records}
        previewRowData={previewRowData}
        columnDefs={columnDefs}
        previewColumnDefs={previewColumnDefs}
        previewRowCount={previewRowCount}
        selectedFile={selectedFile}
        searchText={debouncedSearchText}
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexShrink: 0, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        <Button variant="outlined" startIcon={downloadMasterMutation.isPending ? <CircularProgress size={16} /> : <DownloadOutlinedIcon sx={{ fontSize: 16 }} />} onClick={handleDownloadCurrentMaster} disabled={downloadMasterMutation.isPending} sx={{ textTransform: "none", fontSize: 12, borderColor: "var(--color-border-light)", color: "var(--color-text-primary)", borderRadius: "var(--radius-md)", py: 0.75, px: 2, "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" } }}>
          Current Employment Status List
        </Button>
        <MasterDataActionTooltipButton tooltip={MODIFY_DATA_TOOLTIP} variant="contained" startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} onClick={handleOverrideClick} disabled={!selectedFile || uploadMasterMutation.isPending || isParsing} sx={{ textTransform: "none", fontSize: 12, bgcolor: "var(--color-primary)", borderRadius: "var(--radius-md)", py: 0.75, px: 2, "&:hover": { bgcolor: "var(--color-primary-hover)" } }}>
          Override Employment Status
        </MasterDataActionTooltipButton>
        <MasterDataActionTooltipButton tooltip={ADD_DATA_TOOLTIP} variant="contained" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={handleAddNewMaster} disabled={!selectedFile || uploadMasterMutation.isPending || isParsing} sx={{ textTransform: "none", fontSize: 12, bgcolor: "var(--color-primary)", borderRadius: "var(--radius-md)", py: 0.75, px: 2, "&:hover": { bgcolor: "var(--color-primary-hover)" } }}>
          Add New Employment Status
        </MasterDataActionTooltipButton>
      </Box>

      <MasterDataOverrideConfirmDialog
        open={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        onConfirm={handleConfirmModify}
        confirming={uploadMasterMutation.isPending}
        dataLabel="employment status"
        fileName={selectedFile?.name}
      />

      {uploadMasterMutation.isPending && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "rgba(255, 255, 255, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <CircularProgress sx={{ color: "var(--color-primary)" }} />
        </Box>
      )}
    </Box>
  );
};

export default EmploymentStatus;
