export const SECTION_LABELS = {
    summary: "Profile",
    experience: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    languages: "Languages",
    volunteer: "Volunteering",
    certifications: "Certifications",
};

export const DEFAULT_ORDER = Object.keys(SECTION_LABELS);

// The user-editable title actually stored on the resume, falling back to
// the generic label only until they rename it (or for sections not yet
// given a custom title).
export function getSectionTitle(resume, sectionKey) {
    if (sectionKey === "summary") {
        return resume.summary?.title || SECTION_LABELS.summary;
    }
    return resume.sections?.[sectionKey]?.title || SECTION_LABELS[sectionKey];
}

// Sections whose items share the "long-form" shape (company/school/name +
// period + description) and can be moved between each other.
export const MOVABLE_SECTIONS = ["experience", "education", "projects", "volunteer", "certifications"];

// Every section type the "Add item" form can create into.
export const ADDABLE_SECTIONS = ["experience", "education", "projects", "skills", "languages", "volunteer", "certifications"];

export const FIELD_LAYOUTS = {
    experience: [
        { key: "company", labelKey: "fields.company" },
        { key: "position", labelKey: "fields.position" },
        { key: "location", labelKey: "fields.location" },
        { key: "period", labelKey: "fields.period" },
    ],
    education: [
        { key: "school", labelKey: "fields.school" },
        { key: "degree", labelKey: "fields.degree" },
        { key: "area", labelKey: "fields.area" },
        { key: "period", labelKey: "fields.period" },
        { key: "grade", labelKey: "fields.grade" },
    ],
    projects: [
        { key: "name", labelKey: "fields.projectName" },
        { key: "period", labelKey: "fields.period" },
    ],
    volunteer: [
        { key: "organization", labelKey: "fields.organization" },
        { key: "location", labelKey: "fields.location" },
        { key: "period", labelKey: "fields.period" },
    ],
    certifications: [
        { key: "name", labelKey: "fields.name" },
        { key: "issuer", labelKey: "fields.issuer" },
        { key: "date", labelKey: "fields.date" },
    ],
};

export const DESCRIPTION_SECTIONS = new Set(["experience", "education", "projects", "volunteer"]);

// Fluency label <-> dot-rating level, kept together so picking a label
// always keeps the resume's rendered dots in sync with it.
export const FLUENCY_LEVELS = [
    { label: "Native", level: 5 },
    { label: "Fluent", level: 4 },
    { label: "Advanced", level: 3 },
    { label: "Intermediate", level: 2 },
    { label: "Basic", level: 1 },
];

export function levelForFluency(label) {
    const match = FLUENCY_LEVELS.find((f) => f.label === label);
    return match ? match.level : 0;
}

export function blankItem(sectionKey) {
    const base = { id: crypto.randomUUID(), hidden: false };

    switch (sectionKey) {
        case "experience":
            return { ...base, company: "", position: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "education":
            return { ...base, school: "", degree: "", area: "", grade: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "projects":
            return { ...base, name: "", period: "", website: { url: "", label: "" }, description: "" };
        case "volunteer":
            return { ...base, organization: "", location: "", period: "", website: { url: "", label: "" }, description: "" };
        case "certifications":
            return { ...base, name: "", issuer: "", date: "", summary: "" };
        case "skills":
            return { ...base, name: "", proficiency: "", level: 0, keywords: [] };
        case "languages":
            return { ...base, language: "", fluency: "", level: 0 };
        default:
            return base;
    }
}

// Compact preview shown on the collapsed item row - a primary label plus a
// secondary detail, so an expanded section doesn't dump every field at once.
export function itemSummary(t, sectionKey, item) {
    switch (sectionKey) {
        case "experience":
            return { primary: item.position || t("fallback.untitledPosition"), secondary: item.company || "" };
        case "education":
            return { primary: item.degree || t("fallback.untitledDegree"), secondary: item.school || "" };
        case "projects":
            return { primary: item.name || t("fallback.untitledProject"), secondary: item.period || "" };
        case "volunteer":
            return { primary: item.organization || t("fallback.untitled"), secondary: item.period || "" };
        case "certifications":
            return { primary: item.name || t("fallback.untitledCertification"), secondary: item.issuer || "" };
        case "skills":
            return { primary: item.name || t("fallback.untitledCategory"), secondary: (item.keywords || []).join(", ") };
        case "languages":
            return { primary: item.language || t("fallback.untitledLanguage"), secondary: item.fluency || "" };
        default:
            return { primary: t("fallback.item"), secondary: "" };
    }
}
