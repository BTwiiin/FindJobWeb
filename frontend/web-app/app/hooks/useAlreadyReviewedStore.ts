import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface State {
  alreadyReviewed: string[];
  _hasHydrated: boolean;
  isHydrating: boolean;
}

interface Actions {
  setAlreadyReviewed: (alreadyReviewed: string[]) => void;
  addAlreadyReviewed: (alreadyReviewed: string) => void;
  setHasHydrated: (state: boolean) => void;
  setIsHydrating: (state: boolean) => void;
  hydrateFromServer: (data: string[]) => void;
}

const useAlreadyReviewedStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      alreadyReviewed: [],
      _hasHydrated: false,
      isHydrating: false,

      setAlreadyReviewed: (ids: string[]) => set({ alreadyReviewed: ids }),

      addAlreadyReviewed: (id: string) => {
        if (!get().alreadyReviewed.includes(id)) {
          set((state) => ({ alreadyReviewed: [...state.alreadyReviewed, id] }));
        }
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setIsHydrating: (state: boolean) => {
        set({ isHydrating: state });
      },

      hydrateFromServer: (data: string[]) => {
        set({ 
          alreadyReviewed: data,
          _hasHydrated: true,
          isHydrating: false 
        });
      },
    }),
    {
      name: 'already-reviewed-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ alreadyReviewed: state.alreadyReviewed }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export default useAlreadyReviewedStore;
