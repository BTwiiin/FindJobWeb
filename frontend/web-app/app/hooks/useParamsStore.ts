import { create } from 'zustand';

type State = {
  searchTerm: string;
  pageSize: number;
  searchValue: string;
  orderBy: string;
  filterBy: string;
  employer?: string;
  minSalary?: number;
  maxSalary?: number;
};

type Actions = {
  setSearchValue: (value: string) => void;
  setParams: (params: Partial<State>) => void;
  reset: () => void;
};

const initialState: State = {
  searchTerm: '',
  pageSize: 100,
  searchValue: '',
  orderBy: 'new',
  filterBy: '',
  employer: undefined,
  minSalary: 0,
  maxSalary: 1000000,
};

export const useParamsStore = create<State & Actions>()((set) => ({
  ...initialState,
  setParams: (newParams: Partial<State>) => {
    set((state) => ({
      ...state,
      ...newParams,
    }));
  },
  reset: () => {
    set(initialState);
  },
  setSearchValue: (value: string) => {
    set({ searchValue: value });
  },
}));
