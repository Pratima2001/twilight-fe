import axiosInstance from "@/utils/apiHelper";

export const eaRatesService = {
  // Download template file
  getDownloadTemplate: async (params = {}) => {
    const response = await axiosInstance.get(
      "/employment-status/download_template",
      { params, responseType: "blob" }
    );
    return response;
  },

  // Download current master data
  getDownloadMaster: async (params = {}) => {
    const response = await axiosInstance.get(
      "/employment-status/download_master",
      { params, responseType: "blob" }
    );
    return response;
  },

  // Upload master data (modify or append)
  uploadMaster: async ({ action, file }) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const { data } = await axiosInstance.post(
      `/employment-status/upload_master?action=${action}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },

  // View master data with pagination and search
  viewMaster: async (params = {}) => {
    const { data } = await axiosInstance.get(
      "/employment-status/view_master",
      { params }
    );
    return data;
  },
};
