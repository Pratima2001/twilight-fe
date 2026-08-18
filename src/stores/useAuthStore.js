"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const getPrimaryRoleId = (roles) => {
  if (!roles) return null;
  const ids = Object.keys(roles).map(Number).filter(Boolean);
  return ids.length ? Math.max(...ids) : null;
};

const initialState = {
  user: null,
  email: null,
  name:null,
  roles: {},
  user_organisations: [],
  currentRoleId: null,
  currentRole: null,
  currentOrganisationId: null,
  _hasHydrated: false,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        const roles = user?.roles || user?.role || {};
        const userOrgs = user?.user_organisations || user?.organisations || [];
        const email = user?.email || null;
        const name= user?.name ||null;
        const primaryRoleId = getPrimaryRoleId(roles);
        const currentRole = primaryRoleId
          ? roles[primaryRoleId] || roles[String(primaryRoleId)]
          : null;
        const currentOrganisationId =
          userOrgs && userOrgs.length
            ? userOrgs[0].id ?? userOrgs[0].organisation_id ?? userOrgs[0]
            : null;

        set(() => ({
          user,
          email,
          name,
          roles,
          user_organisations: userOrgs,
          currentRoleId: primaryRoleId,
          currentRole,
          currentOrganisationId,
        }));
      },

      setCurrentRoleId: (roleId) => {
        const roles = get().roles || {};
        const role = roles[roleId] || roles[String(roleId)] || null;
        set({ currentRoleId: roleId, currentRole: role });
      },

      setCurrentRole: (role) => set({ currentRole: role }),

      setOrganisations: (orgs) => {
        const id = orgs && orgs.length ? orgs[0].id ?? orgs[0].organisation_id ?? orgs[0] : null;
        set({ user_organisations: orgs || [], currentOrganisationId: id });
      },

      setCurrentOrganisation: (id) => set({ currentOrganisationId: id }),

      switchOrganisation: (id) => set({ currentOrganisationId: id }),

      clearUser: () =>
        set({
          user: null,
          email: null,
          roles: {},
          user_organisations: [],
          currentRoleId: null,
          currentRole: null,
          currentOrganisationId: null,
        }),

      logout: () =>
        set({
          user: null,
          email: null,
          name: null,
          roles: {},
          user_organisations: [],
          currentRoleId: null,
          currentRole: null,
          currentOrganisationId: null,
        }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      getPrimaryRoleId,
    }),
    {
      name: "twilight_auth",
      partialize: (state) => ({
        user: state.user,
        email: state.email,
        name: state.name,
        roles: state.roles,
        user_organisations: state.user_organisations,
        currentRoleId: state.currentRoleId,
        currentRole: state.currentRole,
        currentOrganisationId: state.currentOrganisationId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
