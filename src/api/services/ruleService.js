import axiosInstance from "@/utils/apiHelper";

export const ruleService = {
  getEnterpriseAgreements: async (orgId) => {
    const { data } = await axiosInstance.get(`/enterprise-agreements/${orgId}`);
    return data ?? [];
  },

  getPayCodesByEA: async (eaId) => {
    const { data } = await axiosInstance.get(`/pay-codes/${eaId}`);
    return data ?? [];
  },

  getAllPayCodes: async () => {
    const { data } = await axiosInstance.get("/pay-codes");
    return data ?? [];
  },

  updatePayCode: async ({ payCode, userValue, updatedBy, reason }) => {
    const { data } = await axiosInstance.put(`/pay-codes/${payCode}`, {
      user_value:
        typeof userValue === "string" ? userValue : JSON.stringify(userValue),
      updated_by: updatedBy,
      reason,
    });
    return data;
  },

  updateRule: async ({ ruleId, eaId, userValue, updatedBy, reason }) => {
    const { data } = await axiosInstance.put(`/pay-codes/rules/${ruleId}`, {
      ea_id: eaId,
      user_value:
        typeof userValue === "string" ? userValue : JSON.stringify(userValue),
      updated_by: updatedBy,
      reason,
    });
    return data;
  },

  resetPayCode: async ({ payCode, updatedBy }) => {
    const { data } = await axiosInstance.post(`/pay-codes/${payCode}/reset`, {
      updated_by: updatedBy,
    });
    return data;
  },

  resetRule: async ({ ruleId, eaId, updatedBy }) => {
    const { data } = await axiosInstance.post(
      `/pay-codes/rules/${ruleId}/reset`,
      {
        ea_id: eaId,
        updated_by: updatedBy,
      }
    );
    return data;
  },
};
