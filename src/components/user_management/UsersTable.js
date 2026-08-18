"use client";

import { useMemo, useRef, useState } from "react";
import { Box, Avatar, Chip, IconButton, Typography } from "@mui/material";
import TableSkeleton from "@/components/common/TableSkeleton";
import { AgGridReact } from "@ag-grid-community/react";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CircleIcon from "@mui/icons-material/Circle";
import AgGridInfo from "@/components/common/AgGridInfo";
import AgGridPagination from "@/components/common/AgGridPagination";
import DeleteUserModal from "@/components/user_management/DeleteUserMode";
import { useDeleteUser } from "@/api/hooks/useUsers";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// ─── Cell Renderers ──────────────────────────────────────────────────────────

const UserIdRenderer = ({ value }) => (
  <Box
    component="span"
    sx={{ fontFamily: "'DM Mono', monospace", fontSize: 11, lineHeight: "40px" }}
  >
    {value}
  </Box>
);

const NameRenderer = ({ data }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: "9px", height: "100%" }}>
    <Avatar
      sx={{
        width: 28,
        height: 28,
        bgcolor: data.avatarColor,
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {data.initials}
    </Avatar>
    <Typography sx={{ fontSize: 12, color: "var(--color-text-primary)" }}>
      {data.full_name}
    </Typography>
  </Box>
);

const RoleRenderer = ({ data }) => {
  const isAdmin = data.role?.trim().toLowerCase() === "admin";
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        size="small"
        icon={
          isAdmin ? (
            <ShieldOutlinedIcon sx={{ fontSize: "12px !important" }} />
          ) : (
            <PersonOutlinedIcon sx={{ fontSize: "12px !important" }} />
          )
        }
        label={
          data.role
            ? data.role.trim().charAt(0).toUpperCase() + data.role.trim().slice(1).toLowerCase()
            : ""
        }
        sx={{
          height: "auto",
          fontSize: 10.5,
          fontWeight: 600,
          borderRadius: "20px",
          px: 0.5,
          bgcolor: isAdmin ? "#E0ECFF" : "#E3F5EB",
          color: isAdmin ? "#1145B5" : "#0D6E3B",
          border: `1px solid ${isAdmin ? "#B8D0F7" : "#9EDCB8"}`,
          "& .MuiChip-icon": { ml: 0.5 },
        }}
      />
    </Box>
  );
};

const StatusRenderer = ({ data }) => {
  const isActive = data.status === "Active";
  return (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      <Chip
        size="small"
        icon={<CircleIcon sx={{ fontSize: "7px !important" }} />}
        label={data.status}
        sx={{
          height: "auto",
          fontSize: 10.5,
          fontWeight: 600,
          borderRadius: "20px",
          px: 0.5,
          bgcolor: isActive ? "#E3F5EB" : "#F6F7FB",
          color: isActive ? "#0D6E3B" : "#8A9ABB",
          border: `1px solid ${isActive ? "#9EDCB8" : "#CDD3E3"}`,
          "& .MuiChip-icon": { ml: 0.5 },
        }}
      />
    </Box>
  );
};

const ActionsRenderer = ({ data, context }) => (
  <Box sx={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center", height: "100%" }}>
    <IconButton
      size="small"
      onClick={() => context.onEditUser?.(data)}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        border: "1px solid var(--color-border-light)",
        bgcolor: "var(--color-bg-primary)",
        color: "var(--color-text-secondary)",
        "&:hover": { bgcolor: "var(--color-bg-subtle)" },
      }}
    >
      <EditOutlinedIcon sx={{ fontSize: 15 }} />
    </IconButton>
    <IconButton
      size="small"
      onClick={() => context.onOpenDelete?.(data)}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        border: "1px solid #F0C5C5",
        bgcolor: "var(--color-bg-primary)",
        color: "#B42B2B",
        "&:hover": { bgcolor: "#FEE9E9" },
      }}
    >
      <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
    </IconButton>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const UserTable = ({
  users = [],
  roles = [],
  onEditUser,
  isLoading = false,
  pagination = {},
  onPageChange,
  onPageSizeChange,
}) => {
  const gridRef = useRef();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const deleteMutation = useDeleteUser();

  // Roles now have `label` field (not `role_name`)
  const roleMap = useMemo(
    () => roles.reduce((acc, r) => ({ ...acc, [r.role_id]: r.label }), {}),
    [roles]
  );

  // Search and role filtering are fully server-side — just enrich the row data
  const rowData = useMemo(() => {
    return users.map((user) => ({
      ...user,
      role: roleMap[user.role_id] || "None",
      status: user.is_active ? "Active" : "Inactive",
      dateAdded: user.created_at
        ? new Date(user.created_at).toLocaleDateString("en-AU")
        : "-",
      initials: user.full_name
        ? user.full_name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "?",
      avatarColor: "#1A56DB",
    }));
  }, [users, roleMap]);

  const columnDefs = useMemo(
    () => [
      {
        field: "user_id",
        headerName: "User ID",
        width: 100,
        cellRenderer: UserIdRenderer,
      },
      {
        field: "full_name",
        headerName: "Full Name",
        flex: 1,
        minWidth: 160,
        cellRenderer: NameRenderer,
      },
      {
        field: "email",
        headerName: "Email Address",
        flex: 1,
        minWidth: 200,
      },
      {
        field: "role",
        headerName: "Role",
        width: 120,
        cellRenderer: RoleRenderer,
      },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: StatusRenderer,
      },
      {
        field: "dateAdded",
        headerName: "Date Added",
        width: 120,
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: ActionsRenderer,
        cellStyle: { display: "flex", justifyContent: "center" },
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({ sortable: true, filter: false, resizable: true }),
    []
  );

  const handleConfirmDelete = async () => {
    if (!selectedUser?.user_id) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.user_id);
    } catch (err) {
      console.error("Delete user error:", err);
    } finally {
      setDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const gridContext = useMemo(
    () => ({
      onEditUser,
      onOpenDelete: (user) => {
        setSelectedUser(user);
        setDeleteOpen(true);
      },
    }),
    [onEditUser]
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Single card containing grid + pagination — matches data-management pattern */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "var(--color-bg-primary)",
          border: "1px solid var(--color-border-light)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <TableSkeleton rows={8} />
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
                  bgcolor: "var(--color-sidebar) !important",
                  "--ag-header-background-color": "var(--color-sidebar)",
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
                  bgcolor: "#F6F7FB",
                },
                "& .ag-row-hover": {
                  bgcolor: "#EEF2FB !important",
                },
                "& .ag-header-icon": {
                  color: "rgba(255,255,255,0.7)",
                },
              }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                context={gridContext}
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

      <DeleteUserModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        user={selectedUser}
      />
    </Box>
  );
};

export default UserTable;
