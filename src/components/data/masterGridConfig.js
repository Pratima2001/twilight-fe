export const masterGridSx = {
  flex: 1,
  width: "100%",
  minHeight: 320,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "& .ag-root-wrapper": {
    flex: 1,
    minHeight: 0,
    height: "100%",
  },
  "& .ag-root-wrapper-body": {
    flex: 1,
    minHeight: 0,
    height: "100%",
  },
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
};

export const defaultMasterColDef = {
  sortable: true,
  filter: false,
  resizable: true,
  suppressMovable: true,
};
