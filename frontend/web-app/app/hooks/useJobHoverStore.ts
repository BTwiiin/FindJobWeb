import { create } from 'zustand';

type JobHoverStore = {
  hoveredJobPostId: string | null;
  setHoveredJobPostId: (id: string | null) => void;
};

export const useJobHoverStore = create<JobHoverStore>((set) => ({
  hoveredJobPostId: null, // Initially no job is hovered
  setHoveredJobPostId: (id) => set({ hoveredJobPostId: id }),
}));