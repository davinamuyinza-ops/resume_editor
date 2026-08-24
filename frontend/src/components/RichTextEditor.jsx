import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import { useTranslation } from "../i18n.js";

export default function RichTextEditor({ value, onChange }) {
    const { t } = useTranslation();
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false, autolink: true }),
        ],
        content: value || "",
        onUpdate: ({ editor: editorInstance }) => {
            onChange(editorInstance.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "", false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!editor) {
        return null;
    }

    function setLink() {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt(t("richtext.linkUrlPrompt"), previousUrl || "https://");

        if (url === null) return;

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }

    return (
        <div className="rich-text-editor">
            <div className="rich-text-toolbar">
                <button
                    type="button"
                    className={editor.isActive("bold") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title={t("richtext.bold")}
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    className={editor.isActive("italic") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title={t("richtext.italic")}
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    className={editor.isActive("underline") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title={t("richtext.underline")}
                >
                    <span style={{ textDecoration: "underline" }}>U</span>
                </button>
                <button
                    type="button"
                    className={editor.isActive("strike") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title={t("richtext.strikethrough")}
                >
                    <span style={{ textDecoration: "line-through" }}>S</span>
                </button>
                <span className="toolbar-divider" />
                <button
                    type="button"
                    className={editor.isActive("bulletList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    title={t("richtext.bulletList")}
                >
                    ☰ List
                </button>
                <button
                    type="button"
                    className={editor.isActive("orderedList") ? "active" : ""}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    title={t("richtext.numberedList")}
                >
                    1. List
                </button>
                <span className="toolbar-divider" />
                <button
                    type="button"
                    className={editor.isActive("link") ? "active" : ""}
                    onClick={setLink}
                    title={t("richtext.addLink")}
                >
                    🔗 Link
                </button>
            </div>
            <EditorContent editor={editor} className="rich-text-content" />
        </div>
    );
}
