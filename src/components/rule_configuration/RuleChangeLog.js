"use client";

import { useMemo, useRef } from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import TableSkeleton from "@/components/common/TableSkeleton";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AgGridInfo from "@/components/common/AgGridInfo";
import AgGridPagination from "@/components/common/AgGridPagination";
import { isWeekendAuditRow, isCoreHourAuditRow } from "@/utils/payCodeUtils";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const FONT = "'DM Sans', sans-serif";

// ─── Label helpers ────────────────────────────────────────────────────────────

const getPayCodeLabel = (row) => {
  const param = row.parameter;
  const isWeekendRule = isWeekendAuditRow(row);

  if (isWeekendRule) {
    if (param === "min_hrs" || param === "min_weekends")
      return `Rule 1 - Weekend rule (${row.pay_code})`;
    if (param === "count0") return `Assumption 1 Hours below this → count 0 (${row.pay_code})`;
    if (param === "count1") return `Assumption 2 Hours below this value → count 1 (${row.pay_code})`;
    if (param === "count2") return `Assumption 3 Hours equal to or above this value → count 2 (${row.pay_code})`;
  }

  if (isCoreHourAuditRow(row)) {
    if (param === "start" || param === "end" || param === "min_weeks") {
      return `Rule 2 - Core hours (${row.pay_code})`;
    }
    if (param === "count1") {
      return `Assumption 1 hours below this → 1 count (${row.pay_code})`;
    }
    if (param === "count2") {
      return `Assumption 2 hours equal to or above this → 2 counts (${row.pay_code})`;
    }
  }

  return row.pay_code || "Unknown Rule";
};

const getParameterLabel = (row) => {
  const param = row.parameter;

  if (isWeekendAuditRow(row)) {
    const map = {
      min_hrs: "Min hrs to qualify",
      min_weekends: "Min weekends to qualify",
      count0: "Assumption 1 hours below qualify/year",
      count1: "Assumption 2 hours up to qualify/year",
      count2: "Assumption 3 hours equal to or above this to qualify/year",
    };
    return map[param] || param;
  }

  if (isCoreHourAuditRow(row)) {
    const map = {
      start: "Core hours start/end",
      end: "Core hours start/end",
      min_weeks: "Core hours min weeks qualify/year",
      count1: "Hours threshold for count 1",
      count2: "Hours threshold for count 2",
    };
    return map[param] || param;
  }

  return param;
};

// ─── Cell Renderers ───────────────────────────────────────────────────────────

const RuleRenderer = ({ data }) => (
  <Box sx={{ fontWeight: 600, fontSize: 11.5, lineHeight: "44px" }}>
    {getPayCodeLabel(data)}
  </Box>
);

const ChangedByRenderer = ({ data }) => (
  <Box sx={{ fontSize: 11.5, lineHeight: "44px" }}>
    {data.created_by}
    {data.role ? <Box component="span" sx={{ color: "var(--color-text-secondary)", ml: 0.5 }}>({data.role})</Box> : null}
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const RuleChangeLog = ({
  auditLogs = [],
  isLoading = false,
  pagination = {},
  search = "",
  onSearchChange,
  onPageChange,
  onPageSizeChange,
}) => {
  const gridRef = useRef();

  const rowData = useMemo(
    () =>
      auditLogs.map((row) => ({
        ...row,
        _ruleLabel: getPayCodeLabel(row),
        _paramLabel: getParameterLabel(row),
      })),
    [auditLogs]
  );

  const columnDefs = useMemo(
    () => [
      {
        field: "_ruleLabel",
        headerName: "Rule / Assumption",
        flex: 2,
        minWidth: 220,
        cellRenderer: RuleRenderer,
      },
      {
        field: "created_by",
        headerName: "Changed By",
        flex: 1,
        minWidth: 160,
        cellRenderer: ChangedByRenderer,
      },
      {
        field: "dateTime",
        headerName: "Date & Time",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "_paramLabel",
        headerName: "Parameter Changed",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "old_value",
        headerName: "Old Value",
        width: 100,
      },
      {
        field: "new_value",
        headerName: "New Value",
        width: 100,
      },
      {
        field: "reason",
        headerName: "Notes",
        flex: 1,
        minWidth: 160,
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, filter: false, resizable: true }),
    []
  );

  const exportToCSV = () => {
    if (!auditLogs.length) return;

    const headers = [
      "Pay Code",
      "Changed By",
      "Role",
      "Date & Time",
      "Parameter Changed",
      "Old Value",
      "New Value",
      "Notes",
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      if (str.includes('"')) return `"${str.replace(/"/g, '""')}"`;
      if (str.includes(",") || str.includes("\n")) return `"${str}"`;
      return str;
    };

    const rows = auditLogs.map((row) => [
      getPayCodeLabel(row),
      row.created_by,
      row.role,
      row.dateTime,
      getParameterLabel(row),
      row.old_value,
      row.new_value,
      row.reason,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((r) => r.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ fontFamily: FONT, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Section label */}
      <Typography
        sx={{
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-text-tertiary)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          mb: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 0.875,
          "&::after": {
            content: '""',
            flex: 1,
            height: "1px",
            bgcolor: "var(--color-border-light)",
          },
        }}
      >
        Audit log — change history
      </Typography>

      {/* Card — fills remaining height as flex column, no padding (grid goes edge-to-edge) */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "var(--color-bg-primary)",
          border: "1px solid var(--color-border-light)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* Card toolbar — owns its own padding */}
        <Box
          sx={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: "22px",
            py: "14px",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>
              Change log
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "var(--color-text-secondary)", mt: "2px" }}>
              Audit trail of all rule and assumption modifications
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            {onSearchChange && (
              <TextField
                size="small"
                placeholder="Search pay code, user…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlinedIcon sx={{ fontSize: 13, color: "var(--color-text-tertiary)" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    fontSize: 12,
                    fontFamily: FONT,
                    borderRadius: "var(--radius-md)",
                    bgcolor: "var(--color-bg-primary)",
                    "& fieldset": { borderColor: "var(--color-border-light)" },
                    "&:hover fieldset": { borderColor: "var(--color-border-light)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--color-border-focus)" },
                  },
                  "& .MuiOutlinedInput-input": { py: "7px" },
                }}
              />
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadOutlinedIcon sx={{ fontSize: 13 }} />}
              onClick={exportToCSV}
              disabled={isLoading || !auditLogs.length}
              sx={{
                fontSize: 11,
                fontFamily: FONT,
                textTransform: "none",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border-light)",
                "&:hover": { borderColor: "var(--color-border-focus)", bgcolor: "var(--color-bg-subtle)" },
              }}
            >
              Export log
            </Button>
          </Box>
        </Box>

        {/* Grid + pagination — skeleton replaces both when loading */}
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : (
          <>
            {/* Grid — borderless inside the card */}
            <Box
              className="ag-theme-alpine"
              sx={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                "& .ag-header": {
                  "--ag-header-background-color": "#3C4A6B",
                },
                "& .ag-header-cell-text": {
                  fontSize: 10.5,
                  fontWeight: 500,
                  color: "#fff !important",
                  textTransform: "none",
                },
                "& .ag-header-cell": {
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  "&:last-child": { borderRight: "none" },
                },
                "& .ag-cell": {
                  fontSize: 11.5,
                  color: "var(--color-text-primary)",
                },
                "& .ag-row": {
                  borderBottom: "1px solid var(--color-border-light)",
                },
                "& .ag-row:nth-of-type(even)": {
                  bgcolor: "#F4F6FA",
                },
                "& .ag-row-hover": {
                  bgcolor: "#EEF2FB !important",
                },
              }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowHeight={44}
                headerHeight={40}
                domLayout="normal"
                pagination={false}
                suppressCellFocus={true}
                suppressPaginationPanel={true}
                suppressMovableColumns={true}
              />
            </Box>

            {/* Pagination footer — anchored to card bottom with border-top separator */}
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--color-border-light)",
                px: 2,
                py: 1.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <AgGridInfo
                currentPage={pagination.page ?? 1}
                rowsPerPage={pagination.page_size ?? 20}
                totalRows={pagination.total_count ?? 0}
              />
              <AgGridPagination
                currentPage={pagination.page ?? 1}
                totalPages={pagination.total_pages ?? 1}
                onPageChange={onPageChange}
                pageSize={pagination.page_size ?? 20}
                onPageSizeChange={onPageSizeChange}
                isLoading={isLoading}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RuleChangeLog;
