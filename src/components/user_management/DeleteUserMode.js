import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box, Button, Dialog, Typography } from "@mui/material";

const FONT = "'DM Sans', sans-serif";

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

const dangerBtnSx = {
  fontSize: 12,
  fontFamily: FONT,
  fontWeight: 500,
  textTransform: "none",
  borderRadius: "var(--radius-md)",
  px: "14px",
  py: "8px",
  bgcolor: "var(--color-danger)",
  color: "#fff",
  boxShadow: "none",
  "&:hover": { bgcolor: "var(--color-danger-hover)", boxShadow: "none" },
};

const DeleteUserModal = ({ open, onClose, onConfirm, user }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
        paper: {
          sx: {
            borderRadius: "var(--radius-lg)",
            p: 3,
            textAlign: "center",
            boxShadow: "var(--shadow-xl)",
          },
        },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          bgcolor: "var(--color-danger-light)",
          border: "2px solid var(--color-danger)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          color: "var(--color-danger)",
        }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 24 }} />
      </Box>

      <Typography
        sx={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", mb: 1 }}
      >
        Delete user
      </Typography>

      <Typography sx={{ fontSize: 12.5, color: "var(--color-text-secondary)", mb: 2.5 }}>
        Are you sure you want to delete{" "}
        <Box component="b" sx={{ color: "var(--color-text-primary)" }}>
          {user?.full_name || "this user"}
        </Box>
        ? This action cannot be undone.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
        <Button onClick={onClose} sx={outlineBtnSx} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} sx={dangerBtnSx} variant="contained">
          Delete
        </Button>
      </Box>
    </Dialog>
  );
};

export default DeleteUserModal;
