import axiosInstance from "@/utils/apiHelper";

export const calculationsService = {
  getCalResults: async (params = {}) => {
    const { data } = await axiosInstance.get("/cal-results/", { params });
    const payload = data?.data ?? data ?? {};

    return {
      records: Array.isArray(payload?.records) ? payload.records : [],
      pagination: payload?.pagination ?? {
        total_count: 0,
        page: params.page ?? 1,
        page_size: params.page_size ?? 20,
        total_pages: 1,
      },
    };
  },

  getTerminatedEmployees: async () => {
    const { data } = await axiosInstance.get("/employee/");
    const employees = Array.isArray(data) ? data : [];

    return employees
      .filter((employee) => employee.term_date != null)
      .sort((a, b) => String(a.employee_id).localeCompare(String(b.employee_id)));
  },

  processRule: async (payload) => {
    const { data } = await axiosInstance.post("transactional/process-rule", payload);
    return data;
  },

  downloadCalResults: async (params = {}) => {
    const response = await axiosInstance.get("/cal-results/download", {
      params: {
        threshold_rule1: params.threshold_rule1,
        threshold_rule2: params.threshold_rule2,
        ...(params.search ? { search: params.search } : {}),
      },
      responseType: "blob",
    });
    return response;
  },
};
