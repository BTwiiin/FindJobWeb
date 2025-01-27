import { create } from 'zustand';
import { JobPost, PagedResult } from '../../types';


type State = {
    jobPosts: JobPost[];
    totalCount: number;
};

type Actions = {
    setData: (data: PagedResult<JobPost>) => void;
    addJobPost: (jobPost: JobPost) => void;
}

const initalState: State = {
    jobPosts: [],
    totalCount: 0,
}


export const useJobPostStore = create<State & Actions>((set) => ({
    ...initalState,
    setData: (data: PagedResult<JobPost>) => set({
        jobPosts: data.results,
        totalCount: data.totalCount,
    }),
    addJobPost: (jobPost: JobPost) => set((state) => ({
        jobPosts: [...state.jobPosts, jobPost],
        totalCount: state.totalCount + 1,
    })),
}));