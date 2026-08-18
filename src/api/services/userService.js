import axiosInstance from "@/utils/apiHelper";

export const userService = {
  getUsers: async ({ page = 1, pageSize = 20, search = "", roleId = null } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (search?.trim()) params.append("search", search.trim());
    if (roleId != null) params.append("role_id", roleId);
    const { data } = await axiosInstance.get(`/users/?${params}`);
    return data?.data ?? { records: [], pagination: {}, stats: {} };
  },

  getRoles: async () => {
    const { data } = await axiosInstance.get("/roles/");
    // API wraps the roles array in data.data
    return data?.data ?? [];
  },

  createUser: async (payload) => {
    const { data } = await axiosInstance.post("/users/", payload);
    return data;
  },

  updateUser: async ({ userId, payload }) => {
    const { data } = await axiosInstance.put(`/users/${userId}`, payload);
    return data;
  },

  deleteUser: async (userId) => {
    const { data } = await axiosInstance.delete(`/users/${userId}`);
    return data;
  },
};
