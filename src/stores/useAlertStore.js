import { create } from "zustand";

const useAlertStore = create((set) => ({
  alert: null,
  setAlert: (alert) => set({ alert }),
  clearAlert: () => set({ alert: null }),
}));

export default useAlertStore;
