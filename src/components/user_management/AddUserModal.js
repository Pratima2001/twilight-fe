"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckIcon from "@mui/icons-material/Check";
import axiosInstance from "@/utils/apiHelper";
import useAuthStore from "@/stores/useAuthStore";
import { queryClient } from "@/lib/queryClient";
import { userQueries } from "@/api/queries/userQueries";
import useAlertStore from "@/stores/useAlertStore";

const FONT = "'DM Sans', sans-serif";

// ─── Shared sx objects (CSS-variable-based) ──────────────────────────────────

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    fontFamily: FONT,
    borderRadius: "var(--radius-md)",
    bgcolor: "var(--color-bg-tertiary)",
    "& fieldset": { borderColor: "var(--color-border-light)" },
    "&:hover fieldset": { borderColor: "var(--color-border-light)" },
    "&.Mui-focused fieldset": { borderColor: "var(--color-border-focus)" },
    "&.Mui-disabled": { bgcolor: "var(--color-bg-tertiary)" },
  },
  "& .MuiOutlinedInput-input": { py: "8px", px: "11px" },
  "& .MuiOutlinedInput-input.Mui-disabled": {
    WebkitTextFillColor: "var(--color-text-tertiary)",
  },
};

const outlineBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  textTransform: "none",
  borderRadius: "var(--radius-md)",
  px: "14px",
  py: "8px",
  color: "var(--color-text-primary)",
  borderColor: "var(--color-border-light)",
  bgcolor: "var(--color-bg-primary)",
  boxShadow: "none",
  "&:hover": {
    bgcolor: "var(--color-bg-tertiary)",
    borderColor: "var(--color-border-light)",
    boxShadow: "none",
  },
};

const primaryBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "var(--radius-md)",
  px: "14px",
  py: "8px",
  bgcolor: "var(--color-primary)",
  color: "#fff",
  boxShadow: "none",
  "&:hover": { bgcolor: "var(--color-primary-hover)", boxShadow: "none" },
};

const dialogPaperSx = {
  borderRadius: "var(--radius-xl)",
  p: "28px 32px",
  width: 440,
  boxShadow: "var(--shadow-xl)",
};

const FieldLabel = ({ children }) => (
  <Typography
    sx={{
      fontSize: 11.5,
      fontWeight: 500,
      color: "var(--color-text-primary)",
      mb: "5px",
      fontFamily: FONT,
    }}
  >
    {children}
  </Typography>
);

// ─────────────────────────────────────────────────────────────────────────────

const emptyForm = {
  name: "",
  email: "",
  role: "",   // or null
  status: "active",
};
const userToForm = (user) => ({
  id: user?.user_id ?? '',
  name: user?.full_name ?? "",
  email: user?.email ?? "",
  role: user?.role_id ?? "",
  status: user?.status === "Inactive" ? "inactive" : "active",
});



const UserSheetForm = ({ user, onClose, onUserCreated, userroles }) => {
  const isEdit = Boolean(user);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState(() =>
    isEdit ? userToForm(user) : emptyForm,
  );
  const { setAlert } = useAlertStore();
  const roles = userroles || [];
  const adminRoleId = roles.find(
    (r) => r.label?.toLowerCase() === "admin"
  )?.role_id;
  const isAdminRoleSelected = form.role === adminRoleId;

  const isEditingAdminUser = isEdit && isAdminRoleSelected;

  const [selectedRole, setUserRole] = useState([]);
  const user1 = useAuthStore((sta) => sta.user);
  


  useEffect(() => {
    console.log("STORE USER:", user1);
    
    const fetchRoles = async () => {
      try {
        console.log('roles fetch');
        console.log(userroles);

        const userRole = userroles.find(
          (role) => role.label?.toLowerCase() === "user"
        );

       
        if (userRole && !isEdit) {
          setForm((prev) => ({
            ...prev,
            role: userRole.role_id,
          }));
        }
        console.log("Form is")
        console.log(form)
      } catch (error) {
        console.log("Failed to fetch roles", error);
      }
    };

    fetchRoles();
    console.log("userroles prop:", userroles);
    console.log("roles used:", roles);
  }, [roles,isEdit]);
  


  const handleSubmit = async () => {
    setApiError("");
    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setAlert({ severity: "warning", message: "Please enter the full name." });
      return;
    }
    if (!email.includes("@")) {
      setAlert({ severity: "warning", message: "Invalid email address." });
      return;
    }
    if (!email.toLowerCase().endsWith("@process-x.com.au")) {
      setAlert({ severity: "warning", message: "Email must be a @process-x.com.au address." });
      return;
    }

    if (isEdit) {
      try {

        const payload = {
          full_name: name,
          email: email,
          is_active: form.status === "active",
          role_id: form.role,
        };
        console.log(payload);
        const response = await axiosInstance.put(
          `/users/${form.id}`,
          payload
        );

        console.log("User Updated:", response.data);

        queryClient.invalidateQueries({ queryKey: userQueries.lists() });
        onClose();
      } catch (error) {
        console.error(
          "Update User Error:",
          error.response?.data || error.message
        );

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to update user.";

        setApiError(message);
      }

      return;
    }

    try {
      console.log("form is ");
      console.log(form);

      const payload = {
        org_id: user1.user_organisations[0]['org_id'],
        full_name: name,
        email: email,
        is_active: form.status === "active",
        created_by: user1.user_id,
        role_id: form.role,
      };

      const response = await axiosInstance.post("/users/", payload);

      console.log("User Created:", response.data);

      onUserCreated({
        name,
        email,
        role_id: form.role,
        role: roles.find((r) => r.role_id === form.role)?.label ?? "",
        empId: response.data['user_id'] || "N/A",
        dateAdded: new Date().toLocaleDateString("en-AU"),
      });
      queryClient.invalidateQueries({ queryKey: userQueries.lists() });
      onClose();

    } catch (error) {
      console.error("Create User Error:", error.response?.data || error.message);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setApiError(message);
    }
  };

  return (
    <>
      <Typography
        sx={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", mb: 0.5 }}
      >
        {isEdit ? "Edit user" : "Add new user"}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "var(--color-text-secondary)", mb: "22px" }}>
        {isEdit
          ? "Update the user's details below. User ID cannot be changed."
          : "Enter the user's details below."}
      </Typography>

      {isEdit && (
        <Box sx={{ mb: 2 }}>
          <FieldLabel>Employee ID</FieldLabel>
          <TextField
            fullWidth
            value={user.user_id}
            disabled
            sx={{
              ...inputSx,
              "& .MuiOutlinedInput-root.Mui-disabled": {
                bgcolor: "var(--color-bg-secondary)",
                "& fieldset": { borderColor: "var(--color-border-light)" },
              },
              "& .MuiOutlinedInput-input.Mui-disabled": {
                WebkitTextFillColor: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              },
            }}
          />
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <FieldLabel>
          Full name{" "}
          <Box component="span" sx={{ color: "var(--color-danger)" }}>
            *
          </Box>
        </FieldLabel>
        <TextField
          fullWidth
          placeholder="e.g. Alex Johnson"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          sx={inputSx}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FieldLabel>
          Email address{" "}
          <Box component="span" sx={{ color: "var(--color-danger)" }}>
            *
          </Box>
        </FieldLabel>
        <TextField
          fullWidth
          type="email"
          placeholder="alex.johnson@process-x.com.au"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          sx={inputSx}
        />
        <Typography sx={{ fontSize: 10.5, color: "var(--color-text-tertiary)", mt: "3px" }}>
          Must be a @process-x.com.au email address
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: "block",
          gridTemplateColumns: isEdit ? "1fr 1fr" : undefined,
          gap: isEdit ? 2 : 0,
        }}
      >
        {/* <Box >
          <FieldLabel fullWidth>
            Role{" "}
            <Box component="span" sx={{ color: "#B42B2B" }}>
              *
            </Box>
          </FieldLabel>
          <FormControl fullWidth sx={inputSx}>
            <Select
              value={form.role}
              displayEmpty
              MenuProps={{
                disablePortal: true,
              }}
              
              onChange={(e) => {
                console.log(e.target.value)
                setForm((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
              }
            >{roles.map((role) => (
              <MenuItem key={role.role_id} value={role.role_id}>
                {role.label}
              </MenuItem>
            ))}</Select>
          </FormControl>
          {!isEdit && (
            <Typography sx={{ fontSize: 10.5, color: "#8A9ABB", mt: "3px" }}>
              Users access Master Data and Calculations. Admins can also
              configure rules.
            </Typography>
          )}
        </Box> */}
        <Box>
          <FieldLabel>
            Role <Box component="span" sx={{ color: "var(--color-danger)" }}>*</Box>
          </FieldLabel>

          {/* EDIT + ADMIN → SHOW TEXT ONLY */}
          {isEditingAdminUser ? (
            <Box
              sx={{
                fontSize: 13,
                fontFamily: FONT,
                px: "13px",
                py: "10px",
                borderRadius: "var(--radius-md)",
                bgcolor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border-light)",
                color: "var(--color-text-primary)",
              }}
            >
              {roles.find((r) => r.role_id === form.role)?.label || "Admin"}
            </Box>
          ) : (
            <FormControl fullWidth sx={inputSx}>
              <Select
                value={form.role}
                displayEmpty
                MenuProps={{
                  disablePortal: true,
                }}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }));
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* {!isEdit && (
            <Typography sx={{ fontSize: 10.5, color: "var(--color-text-tertiary)", mt: "3px" }}>
              Users access Master Data and Calculations. Admins can also configure rules.
            </Typography>
          )} */}
        </Box>

      </Box>
      <Box 
      sx={{
        mb: 2,
        display: "block",
        gridTemplateColumns: isEdit ? "1fr 1fr" : undefined,
        gap: isEdit ? 2 : 0,
      }}>
        <FieldLabel>
          Status <Box component="span" sx={{ color: "var(--color-danger)" }}>*</Box>
        </FieldLabel>

        <FormControl fullWidth sx={inputSx}>
          <Select
            displayEmpty
            MenuProps={{
              disablePortal: true,
            }}
            value={form.status || "active"}
            
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {apiError && (
        <Box
          sx={{
            bgcolor: "var(--color-danger-light)",
            border: "1px solid var(--color-danger)",
            color: "var(--color-danger-hover)",
            borderRadius: "var(--radius-md)",
            p: "10px 12px",
            fontSize: 12,
            mb: 2,
          }}
        >
          {apiError}
        </Box>
      )}

      {/* {!isEdit && (
        <Box
          sx={{
            bgcolor: "#E0ECFF",
            border: "1px solid #B8D0F7",
            borderRadius: "9px",
            p: "10px 14px",
            fontSize: 11.5,
            color: "#1145B5",
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 15, flexShrink: 0, mt: "1px" }} />
          <Typography sx={{ fontSize: 11.5, color: "#1145B5" }}>
            An Employee ID will be auto-generated in the format{" "}
            <strong>TAC-USR-XXX</strong> (or <strong>TAC-ADM-XXX</strong> for
            admins) and displayed after successful submission.
          </Typography>
        </Box>
      )} */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "9px",
          mt: "22px",
        }}
      >
        <Button variant="outlined" onClick={onClose} sx={outlineBtnSx}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            isEdit ? (
              <SaveOutlinedIcon sx={{ fontSize: 14 }} />
            ) : (
              <PersonAddOutlinedIcon sx={{ fontSize: 14 }} />
            )
          }
          onClick={handleSubmit}
          sx={primaryBtnSx}
        >
          {isEdit ? "Save changes" : "Create user"}
        </Button>
      </Box>
    </>
  );
};

const AddUserModal = ({ user, open, onClose, roles }) => {
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);

  const handleUserCreated = (data) => {

    setCreatedUser(data);
    setSuccessOpen(true);
  };
  const handleSubmit = async (data) => {
    console.log(data);
    setCreatedUser(data);
    setSuccessOpen(true);

  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    setCreatedUser(null);
  };

  if (!open && !successOpen) {
    return null;
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
          paper: { sx: dialogPaperSx },
        }}
        sx={{ zIndex: 1400 }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 28,
            height: 28,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-light)",
            color: "var(--color-text-tertiary)",
            "&:hover": { bgcolor: "var(--color-bg-secondary)" },
          }}
        >
          <CloseIcon sx={{ fontSize: 15 }} />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          {open && (
            <UserSheetForm
              key={user?.id ?? "add"}
              user={user}
              onClose={onClose}
              onUserCreated={handleSubmit}
              userroles={roles}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={successOpen}
        onClose={handleSuccessClose}
        maxWidth={false}
        slotProps={{
          backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
          paper: { sx: { ...dialogPaperSx, width: 400, textAlign: "center" } },
        }}
        sx={{ zIndex: 1500 }}
      >
        <DialogContent sx={{ p: "2px 4px" }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "var(--color-success-light)",
              border: "2px solid var(--color-success)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
              color: "var(--color-success-hover)",
            }}
          >
            <CheckCircleOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>

          <Typography
            sx={{ fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)", mb: 0.75 }}
          >
            User created successfully
          </Typography>
          {/* <Typography sx={{ fontSize: 12.5, color: "#5A6A8A", mb: 2.5 }}>
            The new user has been added to the platform. Share the Employee ID
            with them for reference.
          </Typography>

          {createdUser && (
            <>
              <Box
                sx={{
                  bgcolor: "#0D2D6B",
                  color: "#fff",
                  borderRadius: "12px",
                  p: "16px 20px",
                  mb: 2.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    mb: 0.75,
                  }}
                >
                  Auto-generated Employee ID
                </Typography>
                <Typography
                  sx={{
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  {createdUser.empId}
                </Typography>
                <Typography
                  sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", mt: 0.5 }}
                >
                  Role: {createdUser.role}
                </Typography>
              </Box>

              {[
                ["Full name", createdUser.name],
                ["Email address", createdUser.email],
                ["Date added", createdUser.dateAdded],
              ].map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    borderBottom: "1px solid #E2E6F0",
                    fontSize: 12,
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Typography sx={{ color: "#5A6A8A" }}>{key}</Typography>
                  <Typography sx={{ fontWeight: 500, color: "#18243E" }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </>
          )} */}

          <Button
            fullWidth
            variant="contained"
            startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
            onClick={handleSuccessClose}
            sx={{ ...primaryBtnSx, mt: 2.5, justifyContent: "center" }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserModal;
