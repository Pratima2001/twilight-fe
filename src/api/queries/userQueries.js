export const userQueries = {
  // Prefix key — use for invalidating ALL paginated user lists after mutations
  lists: () => ["users", "list"],
  list: (params) => ["users", "list", params],
  roles: () => ["users", "roles"],
};
