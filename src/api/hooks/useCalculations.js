import { useMutation, useQuery } from "@tanstack/react-query";
import { calculationsService } from "../services/calculationsService";
import { calculationsQueries } from "../queries/calculationsQueries";
import { queryClient } from "@/lib/queryClient";

export const useViewCalResults = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: [...calculationsQueries.results, params],
    queryFn: () => calculationsService.getCalResults(params),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useTerminatedEmployees = (enabled = true) => {
  return useQuery({
    queryKey: calculationsQueries.terminatedEmployees,
    queryFn: () => calculationsService.getTerminatedEmployees(),
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useProcessRule = () => {
  return useMutation({
    mutationFn: (payload) => calculationsService.processRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calculationsQueries.results });
    },
  });
};

export const useDownloadCalResults = () => {
  return useMutation({
    mutationFn: (params = {}) => calculationsService.downloadCalResults(params),
  });
};
