import { create } from "zustand";
import { temporal } from "zundo";

export const useResumeStore = create(
    temporal(
        (set) => ({
            resume: null,

            setResume: (resume) => set({ resume }),

            updateBasicsField: (field, value) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        basics: { ...state.resume.basics, [field]: value },
                    },
                })),

            updateWebsiteField: (field, value) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        basics: {
                            ...state.resume.basics,
                            website: { ...state.resume.basics.website, [field]: value },
                        },
                    },
                })),

            addCustomField: () =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        basics: {
                            ...state.resume.basics,
                            customFields: [
                                ...(state.resume.basics.customFields || []),
                                { id: crypto.randomUUID(), icon: "", text: "", link: "" },
                            ],
                        },
                    },
                })),

            removeCustomField: (id) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        basics: {
                            ...state.resume.basics,
                            customFields: (state.resume.basics.customFields || []).filter((f) => f.id !== id),
                        },
                    },
                })),

            updateCustomField: (id, field, value) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        basics: {
                            ...state.resume.basics,
                            customFields: (state.resume.basics.customFields || []).map((f) =>
                                f.id === id ? { ...f, [field]: value } : f
                            ),
                        },
                    },
                })),

            updatePictureField: (field, value) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        picture: { ...state.resume.picture, [field]: value },
                    },
                })),

            updateSummaryContent: (content) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        summary: { ...state.resume.summary, content },
                    },
                })),

            updateMetadataField: (field, value) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        metadata: { ...state.resume.metadata, [field]: value },
                    },
                })),

            setSectionOrder: (order) =>
                set((state) => ({
                    resume: {
                        ...state.resume,
                        metadata: { ...state.resume.metadata, sectionOrder: order },
                    },
                })),

            toggleSectionHidden: (sectionKey) =>
                set((state) => {
                    const section = state.resume.sections[sectionKey];
                    return {
                        resume: {
                            ...state.resume,
                            sections: {
                                ...state.resume.sections,
                                [sectionKey]: { ...section, hidden: !section.hidden },
                            },
                        },
                    };
                }),

            updateItemField: (sectionKey, itemId, field, value) =>
                set((state) => {
                    const section = state.resume.sections[sectionKey];
                    const items = section.items.map((item) =>
                        item.id === itemId ? { ...item, [field]: value } : item
                    );
                    return {
                        resume: {
                            ...state.resume,
                            sections: {
                                ...state.resume.sections,
                                [sectionKey]: { ...section, items },
                            },
                        },
                    };
                }),

            reorderItems: (sectionKey, newItems) =>
                set((state) => {
                    const section = state.resume.sections[sectionKey];
                    return {
                        resume: {
                            ...state.resume,
                            sections: {
                                ...state.resume.sections,
                                [sectionKey]: { ...section, items: newItems },
                            },
                        },
                    };
                }),

            moveItemBetweenSections: (fromKey, toKey, itemId) =>
                set((state) => {
                    const fromSection = state.resume.sections[fromKey];
                    const toSection = state.resume.sections[toKey];
                    const item = fromSection.items.find((i) => i.id === itemId);

                    if (!item) {
                        return state;
                    }

                    return {
                        resume: {
                            ...state.resume,
                            sections: {
                                ...state.resume.sections,
                                [fromKey]: {
                                    ...fromSection,
                                    items: fromSection.items.filter((i) => i.id !== itemId),
                                },
                                [toKey]: {
                                    ...toSection,
                                    items: [...toSection.items, item],
                                },
                            },
                        },
                    };
                }),
        }),
        { limit: 50 }
    )
);
