import { useMutation, useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { userQueries } from "../queries/userQueries";
import { queryClient } from "@/lib/queryClient";

export const useGetUsers = ({ page = 1, pageSize = 20, search = "", roleId = null } = {}, options = {}) =>
  useQuery({
    queryKey: userQueries.list({ page, pageSize, search, roleId }),
    queryFn: () => userService.getUsers({ page, pageSize, search, roleId }),
    ...options,
  });

const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

export const useGetRoles = (options = {}) =>
  useQuery({
    queryKey: userQueries.roles(),
    queryFn: userService.getRoles,
    // Capitalise labels in the hook so every consumer gets ready-to-render options
    select: (roles) => roles.map((r) => ({ ...r, label: capitalise(r.label) })),
    ...options,
  });

export const useCreateUser = () =>
  useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      // Invalidate all paginated user lists
      queryClient.invalidateQueries({ queryKey: userQueries.lists() });
    },
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: ({ userId, payload }) => userService.updateUser({ userId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueries.lists() });
    },
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (userId) => userService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueries.lists() });
    },
  });
