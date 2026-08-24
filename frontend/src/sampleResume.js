export const SAMPLE_RESUME = {
    picture: {
        hidden: false,
        url: "https://ui-avatars.com/api/?name=Jordan+Lee&size=300&background=0F3381&color=fff",
    },
    basics: {
        name: "Jordan Lee",
        headline: "Product Designer",
        email: "jordan.lee@example.com",
        phone: "+1 555 0100",
        location: "Austin, TX",
        website: { url: "https://linkedin.com/in/example", label: "LinkedIn" },
        customFields: [{ id: "1", icon: "", text: "Portfolio: example.com", link: "https://example.com" }],
    },
    summary: {
        title: "Profile",
        hidden: false,
        content:
            "<p>Product designer with 5+ years building user-centered interfaces for web and mobile products. Focused on design systems, accessibility, and close collaboration with engineering teams.</p>",
    },
    sections: {
        experience: {
            title: "Experience",
            hidden: false,
            items: [
                {
                    id: "1",
                    hidden: false,
                    company: "Northwind Studio",
                    position: "Senior Product Designer",
                    location: "Remote",
                    period: "2022 - Present",
                    website: { url: "", label: "" },
                    description:
                        "<ul><li><p>Led redesign of the core onboarding flow, improving completion rate by 18%.</p></li><li><p>Built and maintained the company's design system used across five product teams.</p></li></ul>",
                },
                {
                    id: "2",
                    hidden: false,
                    company: "Bright Labs",
                    position: "Product Designer",
                    location: "Austin, TX",
                    period: "2019 - 2022",
                    website: { url: "", label: "" },
                    description:
                        "<ul><li><p>Designed and shipped features for a B2B analytics dashboard used by 10k+ customers.</p></li></ul>",
                },
            ],
        },
        education: {
            title: "Education",
            hidden: false,
            items: [
                {
                    id: "1",
                    hidden: false,
                    school: "University of Texas at Austin",
                    degree: "B.S.",
                    area: "Human-Computer Interaction",
                    grade: "",
                    location: "",
                    period: "2015 - 2019",
                    website: { url: "", label: "" },
                    description: "",
                },
            ],
        },
        projects: { title: "Projects", hidden: false, items: [] },
        skills: {
            title: "Skills",
            hidden: false,
            items: [
                {
                    id: "1",
                    hidden: false,
                    name: "Design",
                    proficiency: "",
                    level: 0,
                    keywords: ["Figma", "Prototyping", "Design Systems", "Accessibility"],
                },
                {
                    id: "2",
                    hidden: false,
                    name: "Collaboration",
                    proficiency: "",
                    level: 0,
                    keywords: ["User Research", "Cross-functional Leadership"],
                },
            ],
        },
        languages: {
            title: "Languages",
            hidden: false,
            items: [{ id: "1", hidden: false, language: "English", fluency: "Native", level: 5 }],
        },
        volunteer: { title: "Volunteering", hidden: false, items: [] },
        certifications: { title: "Certifications", hidden: false, items: [] },
    },
    customSections: [],
    metadata: {
        template: "classic",
        sectionOrder: ["summary", "experience", "education", "projects", "skills", "languages", "volunteer", "certifications"],
        pageFormat: "a4",
        fontFamily: "Lato, 'Segoe UI', Arial, sans-serif",
        fontSize: "9.5pt",
        primaryColor: "#0f3381",
        margin: "14mm 16mm",
        lineHeight: "1.45",
    },
};
