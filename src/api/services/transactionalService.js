import axiosInstance from "@/utils/apiHelper";

export const transactionalService = {
  // Download template file
  getDownloadTemplate: async (params = {}) => {
    const response = await axiosInstance.get(
      "/transactional/download_template",
      { params, responseType: "blob" }
    );
    return response;
  },

  // Download current master data
  getDownloadMaster: async (params = {}) => {
    const response = await axiosInstance.get(
      "/transactional/download_master",
      { params, responseType: "blob" }
    );
    return response;
  },

  // Upload master data (modify or append)
  uploadMaster: async ({ action, file }) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const { data } = await axiosInstance.post(
      `/transactional/upload_master?action=${action}`,
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
      "/transactional/view_master",
      { params }
    );
    return data;
  },
};
