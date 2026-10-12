import { create } from "zustand";

// Holds the job description handed in from the main app (if this editor was
// opened right after tailoring a resume against a specific job) - kept out
// of the undo-tracked resume store since it's incoming context, not
// something the user edits/undoes.
export const useSourceJobStore = create((set) => ({
    jobDescription: null,
    setJobDescription: (jobDescription) => set({ jobDescription }),
}));
