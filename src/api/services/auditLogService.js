import axiosInstance from "@/utils/apiHelper";

export const auditLogService = {
  getAuditLogs: async ({ page = 1, pageSize = 20, search = "" } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (search?.trim()) params.append("search", search.trim());
    const { data } = await axiosInstance.get(`/audit-logs/?${params}`);
    return data?.data ?? { records: [], pagination: {} };
  },
};
