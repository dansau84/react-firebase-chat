import { create } from "zustand";
import { db } from "./firebase";
import { doc, getDoc,onSnapshot } from "firebase/firestore";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  unSubUser: null,

  fetchUserInfo: (uid) => {
    if (!uid) {
      return set({ currentUser: null, isLoading: false });
    }

    // Cancelar suscripción previa si existe para evitar fugas de memoria
    const currentUnSub = useUserStore.getState().unSubUser;
    if (currentUnSub) currentUnSub();

    try {
      const unSub = onSnapshot(doc(db, "users", uid), (docSnap) => {
        if (docSnap.exists()) {
          set({ currentUser: { ...docSnap.data(), id: docSnap.id }, isLoading: false });
        } else {
          set({ currentUser: null, isLoading: false });
        }
      });

      set({ unSubUser: unSub });
    } catch (err) {
      console.error("Error fetching user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));