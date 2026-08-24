export default function Slider({ label, value, min, max, step = 1, unit = "", onChange }) {
    const percent = ((value - min) / (max - min)) * 100;

    return (
        <label className="slider-field">
            <span className="slider-label">
                {label}
                <span className="slider-value">{value}{unit}</span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ "--range-progress": `${percent}%` }}
            />
        </label>
    );
}
