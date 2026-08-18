export const normalizeHeader = (header) =>
  header
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s\-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "") || "";

export const formatPreviewHeader = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getPreviewColumnDefsFromKeys = (keys = []) =>
  keys.map((key) => ({
    field: key,
    headerName: formatPreviewHeader(key),
    flex: 1,
    minWidth: 120,
  }));

export const getPreviewColumnDefs = (rows) => {
  if (!rows?.length) {
    return [];
  }
  return getPreviewColumnDefsFromKeys(Object.keys(rows[0]));
};
