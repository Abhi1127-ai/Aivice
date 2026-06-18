export default function LedgerField({
                                        label,
                                        type = "text",
                                        value,
                                        onChange,
                                        name,
                                        placeholder,
                                        required = true,
                                        error,
                                    }) {
    return (
        <div className="mb-5">
            <label className="block font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-2">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-transparent border-b-2 ${
                    error ? "border-[#FF6B4A]" : "border-[#D8D1C2]"
                } pb-2 text-[#15203B] font-body-aivice text-base placeholder:text-[#C7C0B2] focus:outline-none focus:border-[#15203B] transition-colors`}
            />
            {error && <p className="mt-1 text-xs text-[#FF6B4A] font-body-aivice">{error}</p>}
        </div>
    );
}
