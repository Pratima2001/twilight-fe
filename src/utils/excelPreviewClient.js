let workerInstance = null;

const getWorker = () => {
  if (!workerInstance) {
    workerInstance = new Worker(
      new URL("../workers/excelPreviewWorker.js", import.meta.url)
    );
  }
  return workerInstance;
};

export const terminateExcelPreviewWorker = () => {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
  }
};

/**
 * Parse an uploaded spreadsheet in a Web Worker with mandatory-column validation.
 * Rows are streamed back in chunks for virtualized grid rendering.
 */
export const parseUploadedFileInWorker = (file, expectedHeaders = [], callbacks = {}) => {
  const { onMeta, onChunk } = callbacks;

  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const requestId = crypto.randomUUID();

    const cleanup = () => {
      worker.removeEventListener("message", handleMessage);
      worker.removeEventListener("error", handleError);
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    const handleMessage = (event) => {
      const data = event.data;
      if (data.requestId !== requestId) return;

      if (data.type === "meta") {
        onMeta?.({
          columnKeys: data.columnKeys,
          totalRows: data.totalRows,
        });
        return;
      }

      if (data.type === "chunk") {
        onChunk?.(data.rows, data.startIndex);
        return;
      }

      if (data.type === "complete") {
        cleanup();
        resolve({
          columnKeys: data.columnKeys || [],
          totalRows: data.totalRows || 0,
        });
        return;
      }

      if (data.type === "error") {
        cleanup();
        reject(new Error(data.message || "Unable to parse uploaded file"));
      }
    };

    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", handleError);

    file
      .arrayBuffer()
      .then((arrayBuffer) => {
        worker.postMessage(
          { arrayBuffer, expectedHeaders, requestId },
          [arrayBuffer]
        );
      })
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });
};
