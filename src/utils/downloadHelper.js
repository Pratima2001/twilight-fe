/**
 * Helper function to download a file from blob response
 * @param {Blob} blob - The blob data from API response
 * @param {string} filename - The filename to save as
 */
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Extract filename from Content-Disposition header
 * @param {Object} headers - Response headers
 * @returns {string} - Extracted filename or default
 */
export const getFilenameFromHeaders = (headers, defaultName = "download.xlsx") => {
  const contentDisposition = headers["content-disposition"];
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].replace(/['"]/g, "");
    }
  }
  return defaultName;
};
