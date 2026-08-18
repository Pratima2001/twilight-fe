import { useMutation, useQuery } from "@tanstack/react-query";
import { eaRatesService } from "../services/esService";
import { eaRatesQueries } from "../queries/esQueries";
import { queryClient } from "@/lib/queryClient";

export const useDownloadEARatesTemplate = () => {
  return useMutation({
    mutationFn: (params = {}) => eaRatesService.getDownloadTemplate(params),
  });
};

export const useDownloadEARatesMaster = () => {
  return useMutation({
    mutationFn: (params = {}) => eaRatesService.getDownloadMaster(params),
  });
};

export const useUploadEARatesMaster = () => {
  return useMutation({
    mutationFn: ({ action, file }) => eaRatesService.uploadMaster({ action, file }),
    onSuccess: () => {
      // Invalidate and refetch EA rates master data
      queryClient.invalidateQueries({ queryKey: eaRatesQueries.viewMaster });
    },
  });
};

export const useViewEARatesMaster = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: [...eaRatesQueries.viewMaster, params],
    queryFn: () => eaRatesService.viewMaster(params),
    enabled: enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
