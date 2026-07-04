export default function LineItemRow({ item, index, onChange, onRemove, onAiImprove, aiLoading, currency }) {
    const sym = currency === "INR" ? "₹" : "$";
    const amount = (Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2);

    const cell = {
        height: 38, padding: "0 10px", border: "1.5px solid #E5E7EB",
        borderRadius: 8, fontSize: 13, color: "#111827", background: "#F9FAFB",
        outline: "none", fontFamily: "'Inter', sans-serif", width: "100%",
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 120px 100px 32px", gap: 8, alignItems: "start", marginBottom: 10 }}>
            {/* Description + AI button */}
            <div>
        <textarea
            value={item.description}
            onChange={e => onChange(index, "description", e.target.value)}
            placeholder="Describe the work…"
            rows={2}
            style={{ ...cell, height: "auto", padding: "8px 10px", resize: "none" }}
        />
                <button
                    type="button"
                    onClick={() => onAiImprove(index)}
                    disabled={!item.description || aiLoading === index}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 11, fontWeight: 500, color: aiLoading === index ? "#9CA3AF" : "#7C3AED",
                        padding: "2px 0", fontFamily: "'Inter', sans-serif",
                        opacity: !item.description ? 0.4 : 1,
                    }}
                >
                    {aiLoading === index ? "Improving…" : "✦ AI Improve"}
                </button>
            </div>

            {/* Qty */}
            <input
                type="number" min="1"
                value={item.quantity}
                onChange={e => onChange(index, "quantity", e.target.value)}
                style={{ ...cell, textAlign: "center" }}
            />

            {/* Unit price */}
            <input
                type="number" min="0" step="0.01"
                value={item.unitPrice}
                onChange={e => onChange(index, "unitPrice", e.target.value)}
                style={{ ...cell, textAlign: "right" }}
            />

            {/* Amount */}
            <div style={{ height: 38, display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {sym}{amount}
            </div>

            {/* Remove */}
            <button
                type="button"
                onClick={() => onRemove(index)}
                style={{ height: 38, background: "#FEF2F2", border: "none", borderRadius: 8, cursor: "pointer", color: "#EF4444", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
                ×
            </button>
        </div>
    );
}
