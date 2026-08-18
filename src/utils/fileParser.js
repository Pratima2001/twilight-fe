import * as XLSX from "xlsx";
import {
  getPreviewColumnDefs,
  getPreviewColumnDefsFromKeys,
  normalizeHeader,
} from "./fileParserUtils";

export { getPreviewColumnDefs, getPreviewColumnDefsFromKeys, normalizeHeader };

const getHeadersFromWorksheet = (worksheet) => {
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
  const headerRow = rows?.[0] || [];
  return headerRow.map(normalizeHeader).filter((header) => header.length > 0);
};

/** @deprecated Prefer parseUploadedFileInWorker for non-blocking preview parsing */
export const parseUploadedFile = async (file, expectedHeaders = []) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];
  const actualHeaders = getHeadersFromWorksheet(worksheet);

  if (expectedHeaders?.length) {
    const normalizedExpected = expectedHeaders.map(normalizeHeader);
    const missingHeaders = normalizedExpected.filter(
      (expectedHeader) => !actualHeaders.includes(expectedHeader)
    );

    if (missingHeaders.length) {
      throw new Error(
        `Missing required columns: ${missingHeaders.join(", ")}`
      );
    }
  }

  return XLSX.utils.sheet_to_json(worksheet, { defval: "" });
};
