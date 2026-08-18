// Caps how many individual row errors we render in the popup so a response
// with thousands of errors doesn't freeze the dialog.
const MAX_LISTED_ERRORS = 100;

/**
 * Builds an alert payload (for useAlertStore.setAlert) from an upload/validation
 * error response.
 *
 * Expected server error shape:
 *   {
 *     detail: {
 *       status: "Error",
 *       message: "Transaction Data validation failed. ...",
 *       errors: ["Row 30184: Pay Period End is required...", ...],
 *       error_count: 4685,
 *       statusCode: 400
 *     }
 *   }
 *
 * - When `errors` are present, returns a scrollable popup listing each row error.
 * - Otherwise falls back to a simple toast with the summary message.
 */
export const buildUploadErrorAlert = (error, fallbackMessage = "Failed to upload file") => {
  const detail = error?.response?.data?.detail;
  const summary = detail?.message || fallbackMessage;
  const errors = Array.isArray(detail?.errors) ? detail.errors : [];

  if (errors.length === 0) {
    return { severity: "error", message: summary };
  }

  const totalCount =
    typeof detail?.error_count === "number" ? detail.error_count : errors.length;
  const listed = errors.slice(0, MAX_LISTED_ERRORS);
  const lines = [...listed];

  const hiddenCount = totalCount - listed.length;
  if (hiddenCount > 0) {
    lines.push(
      `…and ${hiddenCount} more error(s). Showing the first ${listed.length}.`
    );
  }

  return {
    severity: "error",
    isPopUp: true,
    title: summary,
    message: lines.join("\n"),
  };
};
