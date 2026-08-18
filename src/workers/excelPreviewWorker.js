import * as XLSX from "xlsx";

const CHUNK_SIZE = 500;

const normalizeHeader = (header) =>
  header
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s\-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "") || "";

const getHeadersFromWorksheet = (worksheet) => {
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  const headerRow = rows?.[0] || [];
  return headerRow.map(normalizeHeader).filter((header) => header.length > 0);
};

self.onmessage = (event) => {
  const { arrayBuffer, expectedHeaders = [], requestId } = event.data;

  try {
    const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      self.postMessage({
        type: "complete",
        requestId,
        columnKeys: [],
        totalRows: 0,
      });
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const actualHeaders = getHeadersFromWorksheet(worksheet);

    if (expectedHeaders.length) {
      const normalizedExpected = expectedHeaders.map(normalizeHeader);
      const missingHeaders = normalizedExpected.filter(
        (expectedHeader) => !actualHeaders.includes(expectedHeader)
      );

      if (missingHeaders.length) {
        self.postMessage({
          type: "error",
          requestId,
          message: `Missing required columns: ${missingHeaders.join(", ")}`,
        });
        return;
      }
    }

    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    const columnKeys = rows.length ? Object.keys(rows[0]) : [];

    self.postMessage({
      type: "meta",
      requestId,
      columnKeys,
      totalRows: rows.length,
    });

    for (let startIndex = 0; startIndex < rows.length; startIndex += CHUNK_SIZE) {
      const chunk = rows.slice(startIndex, startIndex + CHUNK_SIZE);
      self.postMessage({
        type: "chunk",
        requestId,
        rows: chunk,
        startIndex,
      });
    }

    self.postMessage({
      type: "complete",
      requestId,
      columnKeys,
      totalRows: rows.length,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      requestId,
      message: error?.message || "Unable to parse uploaded file",
    });
  }
};
