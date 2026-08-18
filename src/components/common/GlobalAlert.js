"use client";

import useAlertStore from "@/stores/useAlertStore";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Severity tokens mapped to portal CSS variables (globals.css).
 * All hardcoded hex values are replaced with var(--*) references so the
 * alert palette automatically follows the portal theme.
 */
const severityConfig = {
  error: {
    icon: (
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: "var(--color-danger-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 7v6M12 17h.01"
            stroke="var(--color-danger)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </Box>
    ),
    title: "Error",
    borderColor: "var(--color-danger-light)",
    rowText: "var(--color-danger)",
    rowBorder: "rgba(217,45,32,0.12)",
    btnBg: "var(--color-danger)",
    btnHover: "var(--color-danger-hover)",
    btnText: "#fff",
  },
  warning: {
    icon: (
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: "var(--color-warning-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v5M12 15h.01"
            stroke="var(--color-warning)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </Box>
    ),
    title: "Warning",
    borderColor: "var(--color-warning-light)",
    rowText: "var(--color-warning-hover)",
    rowBorder: "rgba(245,158,11,0.15)",
    btnBg: "var(--color-warning)",
    btnHover: "var(--color-warning-hover)",
    btnText: "var(--color-text-primary)",
  },
  success: {
    icon: (
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: "var(--color-success-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 12l2 2 4-4"
            stroke="var(--color-success)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Box>
    ),
    title: "Success",
    borderColor: "var(--color-success-light)",
    rowText: "var(--color-success-hover)",
    rowBorder: "rgba(16,185,129,0.12)",
    btnBg: "var(--color-success)",
    btnHover: "var(--color-success-hover)",
    btnText: "#fff",
  },
  info: {
    icon: (
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: "var(--color-info-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 16v-4M12 8h.01"
            stroke="var(--color-info)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </Box>
    ),
    title: "Info",
    borderColor: "var(--color-info-light)",
    rowText: "var(--color-info-hover)",
    rowBorder: "rgba(59,130,246,0.12)",
    btnBg: "var(--color-info)",
    btnHover: "var(--color-info-hover)",
    btnText: "#fff",
  },
};

/**
 * GlobalAlert — renders either:
 *  • A Snackbar toast for short, single-line messages (default)
 *  • A Dialog popup for isPopUp:true alerts, with scrollable multi-line support
 *
 * Usage:
 *   const { setAlert } = useAlertStore();
 *
 *   // Toast
 *   setAlert({ severity: "success", message: "Saved successfully." });
 *
 *   // Popup (supports multi-line via \n)
 *   setAlert({ severity: "info", isPopUp: true, message: "Line 1\nLine 2" });
 *
 *   // Custom title
 *   setAlert({ severity: "error", isPopUp: true, title: "Validation errors", message: "..." });
 */
const GlobalAlert = () => {
  const { alert, clearAlert } = useAlertStore();

  if (!alert) return null;

  const cfg = severityConfig[alert.severity] ?? severityConfig.error;

  if (alert.isPopUp) {
    const lines =
      typeof alert.message === "string"
        ? alert.message.split("\n").map((l) => l.trim()).filter(Boolean)
        : [];
    const isMultiLine = lines.length > 1;

    return (
      <Dialog
        open={true}
        onClose={(_, reason) => {
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") clearAlert();
        }}
        maxWidth="sm"
        fullWidth
        paperprops={{
          sx: {
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-xl)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 2,
            borderBottom: isMultiLine ? `1px solid ${cfg.borderColor}` : "none",
          }}
        >
          {cfg.icon}
          <Box>
            <Typography
              sx={{
                fontWeight: "var(--font-weight-semibold)",
                fontSize: "var(--font-size-xl)",
                lineHeight: 1.3,
                color: cfg.rowText,
                fontFamily: "var(--font-primary)",
              }}
            >
              {alert.title || cfg.title}
            </Typography>
            {isMultiLine && (
              <Typography
                sx={{
                  fontSize: "var(--font-size-md)",
                  color: "var(--color-text-secondary)",
                  mt: 0.25,
                  fontFamily: "var(--font-primary)",
                }}
              >
                Below are the issues found:
              </Typography>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {isMultiLine ? (
            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                borderBottom: `1px solid ${cfg.borderColor}`,
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: cfg.borderColor,
                  borderRadius: "var(--radius-sm)",
                },
              }}
            >
              {lines.map((line, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 2.5,
                    py: 1,
                    borderBottom:
                      i < lines.length - 1 ? `1px solid ${cfg.rowBorder}` : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      mt: "7px",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: cfg.rowText,
                      flexShrink: 0,
                      opacity: 0.5,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "var(--font-size-md)",
                      color: cfg.rowText,
                      fontFamily: "var(--font-mono)",
                      lineHeight: 1.6,
                    }}
                  >
                    {line}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ px: 2.5, py: 2 }}>
              <Typography
                sx={{
                  fontSize: "var(--font-size-lg)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-primary)",
                }}
              >
                {alert.message}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: "flex-end" }}>
          <Button
            onClick={clearAlert}
            variant="contained"
            disableElevation
            sx={{
              minWidth: 90,
              fontSize: "var(--font-size-md)",
              fontWeight: "var(--font-weight-medium)",
              textTransform: "none",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-primary)",
              color: cfg.btnText,
              bgcolor: cfg.btnBg,
              "&:hover": { bgcolor: cfg.btnHover },
            }}
          >
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Snackbar
      open
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={3500}
      onClose={clearAlert}
      sx={{ top: { xs: 16, sm: 24 } }}
    >
      <Alert
        severity={alert.severity || "error"}
        onClose={clearAlert}
        sx={{
          fontFamily: "var(--font-primary)",
          fontSize: "var(--font-size-md)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          whiteSpace: "pre-line",
          "& .MuiAlert-message": { fontFamily: "var(--font-primary)" },
        }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalAlert;
