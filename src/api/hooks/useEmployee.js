import { useMutation, useQuery } from "@tanstack/react-query";
import { employeeService } from "../services/employeeService";
import { employeeQueries } from "../queries/employeeQueries";
import { queryClient } from "@/lib/queryClient";

export const useDownloadEmployeeTemplate = () => {
  return useMutation({
    mutationFn: (params = {}) => employeeService.getDownloadTemplate(params),
  });
};

export const useDownloadEmployeeMaster = () => {
  return useMutation({
    mutationFn: (params = {}) => employeeService.getDownloadMaster(params),
  });
};

export const useUploadEmployeeMaster = () => {
  return useMutation({
    mutationFn: ({ action, file }) => employeeService.uploadMaster({ action, file }),
    onSuccess: () => {
      // Invalidate and refetch employee master data
      queryClient.invalidateQueries({ queryKey: employeeQueries.viewMaster });
    },
  });
};

export const useViewEmployeeMaster = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: [...employeeQueries.viewMaster, params],
    queryFn: () => employeeService.viewMaster(params),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 10 * 1000, // 10 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
