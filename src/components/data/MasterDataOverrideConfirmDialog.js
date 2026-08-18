"use client";

import { Box, Button, Dialog, Typography } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { MODIFY_DATA_TOOLTIP } from "@/components/data/masterDataTooltips";

const outlineBtnSx = {
  textTransform: "none",
  fontSize: 12,
  borderColor: "var(--color-border-light)",
  color: "var(--color-text-primary)",
  borderRadius: "var(--radius-md)",
  px: 2.5,
  "&:hover": { borderColor: "var(--color-border-light)", bgcolor: "var(--color-bg-tertiary)" },
};

const dangerBtnSx = {
  textTransform: "none",
  fontSize: 12,
  bgcolor: "var(--color-danger)",
  borderRadius: "var(--radius-md)",
  px: 2.5,
  boxShadow: "none",
  "&:hover": { bgcolor: "var(--color-danger-hover)", boxShadow: "none" },
};

const MasterDataOverrideConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  confirming = false,
  dataLabel,
  fileName,
}) => (
  <Dialog
    open={open}
    onClose={() => !confirming && onClose()}
    maxWidth="xs"
    fullWidth
    slotProps={{
      backdrop: { sx: { bgcolor: "rgba(7, 22, 56, 0.55)" } },
      paper: {
        sx: {
          borderRadius: "12px",
          p: 3,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(7, 22, 56, 0.18)",
        },
      },
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: "#FEF3C7",
        border: "2px solid #F59E0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
        color: "#D97706",
      }}
    >
      <WarningAmberRoundedIcon sx={{ fontSize: 24 }} />
    </Box>

    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", mb: 1 }}>
      Override {dataLabel}?
    </Typography>

    <Typography sx={{ fontSize: 12.5, color: "var(--color-text-secondary)", mb: fileName ? 0.75 : 2.5 }}>
      {MODIFY_DATA_TOOLTIP} This action cannot be undone.
    </Typography>

    {fileName && (
      <Typography sx={{ fontSize: 12.5, color: "var(--color-text-secondary)", mb: 2.5 }}>
        File: <strong>{fileName}</strong>
      </Typography>
    )}

    <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
      <Button onClick={onClose} disabled={confirming} variant="outlined" sx={outlineBtnSx}>
        Cancel
      </Button>
      <Button onClick={onConfirm} disabled={confirming} variant="contained" sx={dangerBtnSx}>
        {confirming ? "Overriding…" : "Override"}
      </Button>
    </Box>
  </Dialog>
);

export default MasterDataOverrideConfirmDialog;
