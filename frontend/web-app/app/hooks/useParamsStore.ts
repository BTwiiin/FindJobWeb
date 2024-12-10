import { create } from 'zustand'

type State = {
    searchTerm: string
    pageSize: number
    searchValue: string
    orderBy: string
    filterBy: string
    employer?: string 
}

type Actions = {
    setSearchValue: (value: string) => void
    setParams: (params: Partial<State>) => void
    reset: () => void
}

const initialState: State = {
    searchTerm: '',
    pageSize: 100,
    searchValue: '',
    orderBy: 'new',   
    filterBy: '',
    employer: undefined 
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
