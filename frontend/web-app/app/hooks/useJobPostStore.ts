import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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


export const useJobPostStore = create<State & Actions>()(
    persist(
        (set) => ({
            ...initalState,
            setData: (data: PagedResult<JobPost>) => set({
                jobPosts: data.results,
                totalCount: data.totalCount,
            }),
            addJobPost: (jobPost: JobPost) => set((state) => ({
                jobPosts: [...state.jobPosts, jobPost],
                totalCount: state.totalCount + 1,
            })),
        }),
        {
            name: 'job-posts-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ jobPosts: state.jobPosts, totalCount: state.totalCount }),
        }
    )
);