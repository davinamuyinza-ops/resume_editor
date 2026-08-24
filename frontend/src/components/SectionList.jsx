import { closestCenter, DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import AddItemForm from "./AddItemForm.jsx";
import ItemFields from "./ItemFields.jsx";
import Modal from "./Modal.jsx";
import RichTextEditor from "./RichTextEditor.jsx";
import { DEFAULT_ORDER, itemSummary, MOVABLE_SECTIONS, SECTION_LABELS } from "../sectionMeta.js";
import { useResumeStore } from "../store/resumeStore.js";

function SortableSection({ sectionKey, expanded, onToggleExpand, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sectionKey });
    const resume = useResumeStore((state) => state.resume);
    const toggleSectionHidden = useResumeStore((state) => state.toggleSectionHidden);

    const style = { transform: CSS.Transform.toString(transform), transition };
    const section = sectionKey === "summary" ? resume.summary : resume.sections[sectionKey];
    const hidden = section?.hidden;

    return (
        <div ref={setNodeRef} style={style} className="section-row">
            <div className="section-row-header">
                <button className="drag-handle" {...attributes} {...listeners} aria-label="Drag to reorder">⠿</button>
                <button className="section-expand-toggle" onClick={onToggleExpand}>
                    <span className="chevron">{expanded ? "▾" : "▸"}</span> {SECTION_LABELS[sectionKey]}
                </button>
                {sectionKey !== "summary" && (
                    <button
                        className={`visibility-toggle ${hidden ? "hidden-state" : ""}`}
                        onClick={() => toggleSectionHidden(sectionKey)}
                    >
                        {hidden ? "Hidden" : "Visible"}
                    </button>
                )}
            </div>
            {expanded && <div className="section-body">{children}</div>}
        </div>
    );
}

function ItemToolbar({ sectionKey, item, items, index }) {
    const reorderItems = useResumeStore((state) => state.reorderItems);
    const deleteItem = useResumeStore((state) => state.deleteItem);
    const toggleItemHidden = useResumeStore((state) => state.toggleItemHidden);

    function moveUp() {
        if (index === 0) return;
        const newItems = [...items];
        [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        reorderItems(sectionKey, newItems);
    }

    function moveDown() {
        if (index === items.length - 1) return;
        const newItems = [...items];
        [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        reorderItems(sectionKey, newItems);
    }

    return (
        <div className="item-toolbar">
            <button onClick={moveUp} disabled={index === 0} title="Move up">↑</button>
            <button onClick={moveDown} disabled={index === items.length - 1} title="Move down">↓</button>
            <button
                onClick={() => toggleItemHidden(sectionKey, item.id)}
                className={`visibility-toggle ${item.hidden ? "hidden-state" : ""}`}
            >
                {item.hidden ? "Hidden" : "Visible"}
            </button>
            <button onClick={() => deleteItem(sectionKey, item.id)} className="delete-item-button">Delete</button>
        </div>
    );
}

function ItemRow({ sectionKey, item, index, items, onEdit }) {
    const summary = itemSummary(sectionKey, item);

    return (
        <div className="item-row-compact">
            <button className="item-row-summary" onClick={() => onEdit({ sectionKey, itemId: item.id })}>
                <span className="item-row-primary">{summary.primary}</span>
                {summary.secondary && <span className="item-row-secondary">{summary.secondary}</span>}
            </button>
            <ItemToolbar sectionKey={sectionKey} item={item} items={items} index={index} />
        </div>
    );
}

export default function SectionList() {
    const resume = useResumeStore((state) => state.resume);
    const setSectionOrder = useResumeStore((state) => state.setSectionOrder);
    const updateSummaryContent = useResumeStore((state) => state.updateSummaryContent);
    const updateItemField = useResumeStore((state) => state.updateItemField);
    const moveItemBetweenSections = useResumeStore((state) => state.moveItemBetweenSections);
    const [expandedKey, setExpandedKey] = useState("experience");
    const [editingItem, setEditingItem] = useState(null);

    const order = resume.metadata?.sectionOrder || DEFAULT_ORDER;

    function handleDragEnd(event) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = order.indexOf(active.id);
        const newIndex = order.indexOf(over.id);
        setSectionOrder(arrayMove(order, oldIndex, newIndex));
    }

    const editingItemData = editingItem
        ? resume.sections[editingItem.sectionKey]?.items?.find((i) => i.id === editingItem.itemId)
        : null;

    return (
        <>
            <AddItemForm />

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={order} strategy={verticalListSortingStrategy}>
                    {order.map((key) => (
                        <SortableSection
                            key={key}
                            sectionKey={key}
                            expanded={expandedKey === key}
                            onToggleExpand={() => setExpandedKey(expandedKey === key ? null : key)}
                        >
                            {key === "summary" && (
                                <RichTextEditor value={resume.summary?.content} onChange={updateSummaryContent} />
                            )}

                            {key !== "summary" &&
                                resume.sections[key]?.items?.map((item, index) => (
                                    <ItemRow
                                        key={item.id}
                                        sectionKey={key}
                                        item={item}
                                        index={index}
                                        items={resume.sections[key].items}
                                        onEdit={setEditingItem}
                                    />
                                ))}
                        </SortableSection>
                    ))}
                </SortableContext>
            </DndContext>

            {editingItem && editingItemData && (
                <Modal title={SECTION_LABELS[editingItem.sectionKey]} onClose={() => setEditingItem(null)}>
                    {editingItem.sectionKey === "skills" && (
                        <div className="item-fields">
                            <label className="item-field">
                                <span>Category name</span>
                                <input
                                    type="text"
                                    value={editingItemData.name || ""}
                                    onChange={(e) => updateItemField("skills", editingItemData.id, "name", e.target.value)}
                                />
                            </label>
                            <label className="item-field item-field-full">
                                <span>Keywords (comma-separated)</span>
                                <input
                                    type="text"
                                    value={(editingItemData.keywords || []).join(", ")}
                                    onChange={(e) =>
                                        updateItemField(
                                            "skills",
                                            editingItemData.id,
                                            "keywords",
                                            e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                                        )
                                    }
                                />
                            </label>
                        </div>
                    )}

                    {editingItem.sectionKey === "languages" && (
                        <div className="item-fields">
                            <label className="item-field">
                                <span>Language</span>
                                <input
                                    type="text"
                                    value={editingItemData.language || ""}
                                    onChange={(e) => updateItemField("languages", editingItemData.id, "language", e.target.value)}
                                />
                            </label>
                            <label className="item-field">
                                <span>Fluency</span>
                                <input
                                    type="text"
                                    value={editingItemData.fluency || ""}
                                    onChange={(e) => updateItemField("languages", editingItemData.id, "fluency", e.target.value)}
                                />
                            </label>
                        </div>
                    )}

                    {MOVABLE_SECTIONS.includes(editingItem.sectionKey) && (
                        <>
                            <ItemFields sectionKey={editingItem.sectionKey} item={editingItemData} />
                            <label className="move-item-select">
                                <span>Move to:</span>
                                <select
                                    value=""
                                    onChange={(event) => {
                                        if (event.target.value) {
                                            moveItemBetweenSections(editingItem.sectionKey, event.target.value, editingItemData.id);
                                            setEditingItem(null);
                                        }
                                    }}
                                >
                                    <option value="">Choose section...</option>
                                    {MOVABLE_SECTIONS.filter((s) => s !== editingItem.sectionKey).map((s) => (
                                        <option key={s} value={s}>{SECTION_LABELS[s]}</option>
                                    ))}
                                </select>
                            </label>
                        </>
                    )}
                </Modal>
            )}
        </>
    );
}
