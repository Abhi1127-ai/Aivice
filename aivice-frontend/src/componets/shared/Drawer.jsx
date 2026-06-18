export default function Drawer({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-[#15203B]/40" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#FBF7EF] h-full overflow-y-auto scroll-thin shadow-2xl fade-up">
                <div className="flex items-center justify-between px-7 py-6 border-b border-[#E4DFD3] sticky top-0 bg-[#FBF7EF]">
                    <h2 className="font-display text-2xl text-[#15203B]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-[#8B8478] hover:text-[#15203B] transition-colors text-2xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="px-7 py-6">{children}</div>
            </div>
        </div>
    );
}
