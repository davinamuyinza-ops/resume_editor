import { useResumeStore } from "../store/resumeStore.js";

export default function BasicsPanel() {
    const resume = useResumeStore((state) => state.resume);
    const updateBasicsField = useResumeStore((state) => state.updateBasicsField);
    const updateWebsiteField = useResumeStore((state) => state.updateWebsiteField);
    const addCustomField = useResumeStore((state) => state.addCustomField);
    const removeCustomField = useResumeStore((state) => state.removeCustomField);
    const updateCustomField = useResumeStore((state) => state.updateCustomField);
    const updatePictureField = useResumeStore((state) => state.updatePictureField);

    const basics = resume.basics || {};
    const website = basics.website || {};
    const customFields = basics.customFields || [];
    const picture = resume.picture || {};

    return (
        <div className="basics-panel">
            <div className="basics-section">
                <div className="basics-section-title">Photo</div>
                <div className="photo-row">
                    <div
                        className="photo-preview"
                        style={{ width: Math.min(picture.size || 70, 100), height: Math.min(picture.size || 70, 100) }}
                    >
                        {!picture.hidden && picture.url ? (
                            <img src={picture.url} alt="" />
                        ) : (
                            <div className="photo-placeholder">No photo</div>
                        )}
                    </div>
                    <div className="photo-controls">
                        <label className="item-field item-field-full">
                            <span>Photo URL</span>
                            <input
                                type="text"
                                value={picture.url || ""}
                                placeholder="https://..."
                                onChange={(e) => updatePictureField("url", e.target.value)}
                            />
                        </label>
                        <label className="item-field item-field-full">
                            <span>Size ({picture.size || 70}px)</span>
                            <input
                                type="range"
                                min="40"
                                max="160"
                                step="5"
                                value={picture.size || 70}
                                onChange={(e) => updatePictureField("size", Number(e.target.value))}
                            />
                        </label>
                        <label className="checkbox-field">
                            <input
                                type="checkbox"
                                checked={!picture.hidden}
                                onChange={(e) => updatePictureField("hidden", !e.target.checked)}
                            />
                            <span>Show photo on resume</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title">Personal details</div>
                <div className="item-fields">
                    <label className="item-field">
                        <span>Full name</span>
                        <input type="text" value={basics.name || ""} onChange={(e) => updateBasicsField("name", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>Headline</span>
                        <input type="text" value={basics.headline || ""} onChange={(e) => updateBasicsField("headline", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>Email</span>
                        <input type="text" value={basics.email || ""} onChange={(e) => updateBasicsField("email", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>Phone</span>
                        <input type="text" value={basics.phone || ""} onChange={(e) => updateBasicsField("phone", e.target.value)} />
                    </label>
                    <label className="item-field item-field-full">
                        <span>Location</span>
                        <input type="text" value={basics.location || ""} onChange={(e) => updateBasicsField("location", e.target.value)} />
                    </label>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title">Website</div>
                <div className="item-fields">
                    <label className="item-field">
                        <span>URL</span>
                        <input type="text" value={website.url || ""} onChange={(e) => updateWebsiteField("url", e.target.value)} />
                    </label>
                    <label className="item-field">
                        <span>Label</span>
                        <input type="text" value={website.label || ""} onChange={(e) => updateWebsiteField("label", e.target.value)} />
                    </label>
                </div>
            </div>

            <div className="basics-section">
                <div className="basics-section-title-row">
                    <div className="basics-section-title">Custom links</div>
                    <button className="add-link-button" onClick={addCustomField}>+ Add link</button>
                </div>
                {customFields.map((field) => (
                    <div key={field.id} className="item-card custom-field-row">
                        <label className="item-field">
                            <span>Text</span>
                            <input
                                type="text"
                                value={field.text || ""}
                                onChange={(e) => updateCustomField(field.id, "text", e.target.value)}
                            />
                        </label>
                        <label className="item-field">
                            <span>Link</span>
                            <input
                                type="text"
                                value={field.link || ""}
                                onChange={(e) => updateCustomField(field.id, "link", e.target.value)}
                            />
                        </label>
                        <button className="remove-link-button" onClick={() => removeCustomField(field.id)}>Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}
