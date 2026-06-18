export function Field({
                          label,
                          type = "text",
                          value,
                          onChange,
                          name,
                          placeholder,
                          required = false,
                          as = "input",
                          options = [],
                      }) {
    const baseClass =
        "w-full bg-white border border-[#D8D1C2] rounded-sm px-3 py-2.5 text-[#15203B] font-body-aivice text-sm placeholder:text-[#C7C0B2] focus:outline-none focus:border-[#15203B] transition-colors";

    return (
        <div className="mb-4">
            <label className="block font-mono-aivice text-[10px] tracking-[0.15em] uppercase text-[#8B8478] mb-1.5">
                {label}
            </label>
            {as === "textarea" ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows={3}
                    className={baseClass}
                />
            ) : as === "select" ? (
                <select name={name} value={value} onChange={onChange} required={required} className={baseClass}>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={baseClass}
                />
            )}
        </div>
    );
}

export function PrimaryButton({ children, onClick, type = "button", disabled, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-[#15203B] text-[#FBF7EF] font-body-aivice font-medium text-sm px-5 py-2.5 rounded-sm hover:bg-[#FF6B4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
}

export function SecondaryButton({ children, onClick, type = "button", disabled, className = "" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-transparent border border-[#D8D1C2] text-[#15203B] font-body-aivice font-medium text-sm px-5 py-2.5 rounded-sm hover:border-[#15203B] transition-colors disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
