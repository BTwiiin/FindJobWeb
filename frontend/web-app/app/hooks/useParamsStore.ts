import { create } from 'zustand'

type State = {
    searchTerm: string
    searchValue: string
    orderBy: string
    filterBy: string
}

type Actions = {
    setSearchValue: (value: string) => void
    setParams: (params: Partial<State>) => void
    reset: () => void
}

const initialState: State = {
    searchTerm: '',
    searchValue: '',
    orderBy: 'make',   // Default order by 'make'
    filterBy: 'live',  // Default filter (can be adjusted based on your needs)
}

export const useParamsStore = create<State & Actions>()((set) => ({
    ...initialState,
    setParams: (newParams: Partial<State>) => {
        set((state) => ({
            ...state,
            ...newParams,  // Updates only the specified parameters
        }))
    },
    reset: () => {
        set(initialState)  // Reset state to initial values
    },
    setSearchValue: (value: string) => {
        set({ searchValue: value })
    },
}))
