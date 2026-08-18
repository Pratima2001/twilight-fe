import { useCallback, useRef, useState } from "react";
import { parseUploadedFileInWorker } from "@/utils/excelPreviewClient";
import { getPreviewColumnDefsFromKeys } from "@/utils/fileParserUtils";

export const useMasterFilePreview = ({ expectedHeaders, onError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewColumnDefs, setPreviewColumnDefs] = useState([]);
  const [previewRowData, setPreviewRowData] = useState([]);
  const [previewRowCount, setPreviewRowCount] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  const parseRequestRef = useRef(0);
  const fileInputRef = useRef(null);

  const isPreviewMode = Boolean(selectedFile);

  const resetPreviewState = useCallback(() => {
    setPreviewRowData([]);
    setPreviewRowCount(0);
    setPreviewColumnDefs([]);
  }, []);

  const resetFileStates = useCallback(() => {
    parseRequestRef.current += 1;
    setSelectedFile(null);
    setIsParsing(false);
    resetPreviewState();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [resetPreviewState]);

  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const requestId = parseRequestRef.current + 1;
      parseRequestRef.current = requestId;

      setSelectedFile(file);
      setIsParsing(true);
      resetPreviewState();

      try {
        await parseUploadedFileInWorker(file, expectedHeaders, {
          onMeta: ({ columnKeys, totalRows }) => {
            if (parseRequestRef.current !== requestId) return;
            setPreviewColumnDefs(getPreviewColumnDefsFromKeys(columnKeys));
            setPreviewRowCount(totalRows);
          },
          onChunk: (rows, startIndex) => {
            if (parseRequestRef.current !== requestId) return;
            const stampedRows = rows.map((row, index) => ({
              ...row,
              __previewRowId: startIndex + index,
            }));
            setPreviewRowData((prev) => [...prev, ...stampedRows]);
          },
        });

        if (parseRequestRef.current !== requestId) return;
      } catch (parseError) {
        if (parseRequestRef.current !== requestId) return;
        resetFileStates();
        onError?.(parseError.message || "Unable to preview uploaded file");
      } finally {
        if (parseRequestRef.current === requestId) {
          setIsParsing(false);
        }
      }
    },
    [expectedHeaders, onError, resetFileStates, resetPreviewState]
  );

  return {
    selectedFile,
    isPreviewMode,
    previewColumnDefs,
    previewRowData,
    previewRowCount,
    isParsing,
    fileInputRef,
    handleFileSelect,
    resetFileStates,
  };
};
