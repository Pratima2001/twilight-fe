"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import AddUserModal from "@/components/user_management/AddUserModal";
import UsersTable from "@/components/user_management/UsersTable";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { useGetUsers, useGetRoles } from "@/api/hooks/useUsers";

const FONT = "'DM Sans', sans-serif";

const selectSx = {
  fontSize: 12,
  fontFamily: FONT,
  bgcolor: "var(--color-bg-primary)",
  color: "var(--color-text-primary)",
  borderRadius: "var(--radius-md)",
  minWidth: 120,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-light)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-light)" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--color-border-focus)" },
};

const Page = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Debounced search — typing doesn't fire requests on every keystroke
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading: usersLoading } = useGetUsers({
    page,
    pageSize,
    search: debouncedSearch,
    roleId: roleFilter,
  });

  const records = data?.records ?? [];
  const pagination = data?.pagination ?? { total_count: 0, page: 1, page_size: 20, total_pages: 1 };
  const apiStats = data?.stats ?? {};

  const stats = [
    { value: apiStats.total_users ?? 0, label: "Total platform users", color: "#1A56DB" },
    { value: apiStats.active_users ?? 0, label: "Active users", color: "#0D6E3B" },
    { value: apiStats.admin_users ?? 0, label: "Admins", color: "#864A00" },
  ];

  const { data: roles = [] } = useGetRoles();

  const handleOpenAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPage(1);
  };

  return (
    <>
      <AppLayout>
        {/* Full-height flex column so the table card fills the viewport */}
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>

          {/* Page Header */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}
              >
                User management
              </Typography>
            </Box>

            <Button
              type="button"
              variant="contained"
              startIcon={<PersonAddOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={handleOpenAdd}
              sx={{
                bgcolor: "var(--color-primary)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 500,
                textTransform: "none",
                borderRadius: "var(--radius-md)",
                px: "14px",
                py: "8px",
                boxShadow: "none",
                alignSelf: { xs: "stretch", sm: "flex-start" },
                "&:hover": { bgcolor: "var(--color-primary-hover)", boxShadow: "none" },
              }}
            >
              Add new user
            </Button>
          </Box>

          {/* Stats Cards — values served directly from API */}
          <Grid container spacing={1.5} sx={{ mb: 2, flexShrink: 0 }}>
            {stats.map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    bgcolor: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border-light)",
                    borderRadius: "var(--radius-lg)",
                    p: "14px 18px",
                  }}
                >
                  <Typography sx={{ fontSize: 22, fontWeight: 600, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 500, mt: 0.5, color: stat.color }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Table Card — fills remaining viewport height */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              bgcolor: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-light)",
              borderRadius: "14px",
              p: "20px 24px",
              overflow: "hidden",
            }}
          >
            {/* Card toolbar */}
            <Box
              sx={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 1.5,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>
                  All users
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: "var(--color-text-secondary)", mt: "2px" }}>
                  Click the edit icon to modify a user, or the delete icon to remove access.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                {/* Role filter — server-side via role_id query param */}
                <Select
                  value={roleFilter === null ? "All Roles" : roleFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRoleFilter(val === "All Roles" ? null : Number(val));
                    setPage(1);
                  }}
                  size="small"
                  sx={selectSx}
                >
                  <MenuItem value="All Roles">All roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.role_id} value={role.role_id}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>


                <Box sx={{ position: "relative" }}>
                  <SearchOutlinedIcon
                    sx={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      color: "var(--color-text-tertiary)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  />
                  <TextField
                    placeholder="Search by name or email…"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{
                      width: { xs: "100%", sm: 220 },
                      "& .MuiOutlinedInput-root": {
                        pl: "32px",
                        fontSize: 12,
                        fontFamily: FONT,
                        borderRadius: "var(--radius-md)",
                        bgcolor: "var(--color-bg-primary)",
                        "& fieldset": { borderColor: "var(--color-border-light)" },
                        "&:hover fieldset": { borderColor: "var(--color-border-light)" },
                        "&.Mui-focused fieldset": { borderColor: "var(--color-border-focus)" },
                      },
                      "& .MuiOutlinedInput-input": { py: "8px", px: "12px" },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Table fills remaining card height */}
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <UsersTable
                users={records}
                roles={roles}
                onEditUser={handleOpenEdit}
                isLoading={usersLoading}
                pagination={pagination}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </Box>
          </Box>

        </Box>
      </AppLayout>

      <AddUserModal
        user={editingUser}
        open={modalOpen}
        onClose={handleCloseModal}
        roles={roles}
      />
    </>
  );
};

export default Page;
