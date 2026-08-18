import { useMutation, useQuery } from "@tanstack/react-query";
import { transactionalService } from "../services/transactionalService";
import { transactionalQueries } from "../queries/transactionalQueries";
import { queryClient } from "@/lib/queryClient";

export const useDownloadTransactionalTemplate = () => {
  return useMutation({
    mutationFn: (params = {}) => transactionalService.getDownloadTemplate(params),
  });
};

export const useDownloadTransactionalMaster = () => {
  return useMutation({
    mutationFn: (params = {}) => transactionalService.getDownloadMaster(params),
  });
};

export const useUploadTransactionalMaster = () => {
  return useMutation({
    mutationFn: ({ action, file }) => transactionalService.uploadMaster({ action, file }),
    onSuccess: () => {
      // Invalidate and refetch transactional master data
      queryClient.invalidateQueries({ queryKey: transactionalQueries.viewMaster });
    },
  });
};

export const useViewTransactionalMaster = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: [...transactionalQueries.viewMaster, params],
    queryFn: () => transactionalService.viewMaster(params),
    enabled: enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
