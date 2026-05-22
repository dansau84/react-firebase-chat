import { create } from "zustand";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const useUserStore = create((set) => ({
  currentUser: null,
  isloading: true,

  
  fetchuserinfo: async (uid) => {
    if (!uid) {
      return set({ currentUser: null, isloading: false });
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isloading: false });
      } else {
        set({ currentUser: null, isloading: false });
      }
    } catch (err) {
      console.log(err);
      set({ currentUser: null, isloading: false });
    }
  },
}));

export { useUserStore };
