import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLogService";
import { auditLogQueries } from "../queries/auditLogQueries";

export const useGetAuditLogs = ({ page = 1, pageSize = 20, search = "" } = {}, options = {}) =>
  useQuery({
    queryKey: auditLogQueries.list({ page, pageSize, search }),
    queryFn: () => auditLogService.getAuditLogs({ page, pageSize, search }),
    ...options,
  });
