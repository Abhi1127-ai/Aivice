export default function LineItemRow({ item, index, onChange, onRemove, onAiImprove, aiLoading, currency }) {
    const symbol = currency === "INR" ? "₹" : "$";
    const amount = (Number(item.quantity || 0) * Number(item.unitPrice || 0)).toFixed(2);

    return (
        <div className="grid grid-cols-[1fr_70px_110px_100px_28px] gap-3 items-start mb-3">
            <div>
        <textarea
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="Describe the work…"
            rows={1}
            className="w-full bg-white border border-[#D8D1C2] rounded-sm px-3 py-2 text-sm font-body-aivice resize-none focus:outline-none focus:border-[#15203B] transition-colors"
        />
                <button
                    type="button"
                    onClick={() => onAiImprove(index)}
                    disabled={!item.description || aiLoading === index}
                    className="mt-1 font-mono-aivice text-[10px] tracking-wide uppercase text-[#7654B3] hover:text-[#15203B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {aiLoading === index ? "Polishing…" : "Improve with AI"}
                </button>
            </div>

            <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onChange(index, "quantity", e.target.value)}
                className="bg-white border border-[#D8D1C2] rounded-sm px-2 py-2 text-sm font-mono-aivice text-center focus:outline-none focus:border-[#15203B] transition-colors"
            />

            <input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onChange(index, "unitPrice", e.target.value)}
                className="bg-white border border-[#D8D1C2] rounded-sm px-2 py-2 text-sm font-mono-aivice text-right focus:outline-none focus:border-[#15203B] transition-colors"
            />

            <div className="px-2 py-2 font-mono-aivice text-sm text-right text-[#15203B]">
                {symbol}{amount}
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-[#8B8478] hover:text-[#D14B2E] transition-colors text-lg leading-none mt-1.5"
                aria-label="Remove line item"
            >
                ×
            </button>
        </div>
    );
}
