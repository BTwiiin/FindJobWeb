import { create } from 'zustand'

type State = {
  searchTerm: string
}

type Actions = {
  setParams: (params: Partial<State>) => void
  reset: () => void
}

const initialState: State = {
  searchTerm: ''
}

export const useParamsStore = create<State & Actions>((set) => ({
  ...initialState,
  setParams: (newParams: Partial<State>) => {
    set((state) => ({
      ...state,
      ...newParams
    }));
  },
  reset: () => set(() => initialState)
}));
