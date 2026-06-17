import "../../styles/auth.css";

const lineItems = [
    { label: "Brand identity & logo suite", amount: "1,200.00" },
    { label: "Website design (6 pages)", amount: "2,450.00" },
    { label: "Monthly retainer — June", amount: "650.00" },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-body-aivice">
            {/* Left: form panel */}
            <div className="flex-1 bg-[#FBF7EF] flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-full max-w-sm">
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 rounded-sm bg-[#15203B] flex items-center justify-center">
                                    <span className="font-mono-aivice text-[#FF6B4A] text-sm font-bold">A</span>
                                </div>
                                <span className="font-mono-aivice text-xs tracking-[0.2em] uppercase text-[#8B8478]">
                  Aivice
                </span>
                            </div>
                            <h1 className="font-display text-4xl text-[#15203B] mb-2">{title}</h1>
                            <p className="text-[#8B8478] text-sm">{subtitle}</p>
                        </div>

                        {children}

                        <div className="mt-8 pt-6 border-t border-[#E4DFD3] text-sm text-[#8B8478]">
                            {footer}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: signature receipt panel */}
            <div className="hidden lg:flex flex-1 bg-[#15203B] relative items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: "radial-gradient(circle, #FBF7EF 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                <div className="receipt-card relative bg-[#FBF7EF] w-[320px] px-7 py-8 shadow-2xl">
                    {/* perforation */}
                    <div className="absolute -top-2 left-0 right-0 flex justify-between px-3">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="w-3 h-3 rounded-full bg-[#15203B]" />
                        ))}
                    </div>

                    <div className="flex items-center justify-between mb-6">
            <span className="font-mono-aivice text-[10px] tracking-[0.25em] uppercase text-[#8B8478]">
              Aivice · Invoice
            </span>
                        <span className="font-mono-aivice text-[10px] text-[#8B8478]">№ 2026-0042</span>
                    </div>

                    <div className="space-y-3 mb-6">
                        {lineItems.map((item, i) => (
                            <div
                                key={item.label}
                                className="receipt-line flex items-baseline justify-between gap-4"
                                style={{ animationDelay: `${0.3 + i * 0.25}s` }}
                            >
                                <span className="text-sm text-[#15203B] leading-snug">{item.label}</span>
                                <span className="font-mono-aivice text-sm text-[#15203B] whitespace-nowrap">
                  ${item.amount}
                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-dashed border-[#D8D1C2] pt-4 flex items-baseline justify-between">
                        <span className="font-display text-lg text-[#15203B]">Total due</span>
                        <span className="font-mono-aivice text-xl font-bold text-[#15203B]">$4,300.00</span>
                    </div>

                    {/* stamp */}
                    <div className="receipt-stamp absolute -right-6 -bottom-6" style={{ animationDelay: "1.4s" }}>
                        <div className="w-20 h-20 rounded-full border-2 border-[#2F9E5B] flex items-center justify-center -rotate-12 bg-[#FBF7EF]">
              <span className="font-mono-aivice text-[#2F9E5B] text-xs font-bold tracking-widest">
                PAID
              </span>
                        </div>
                    </div>
                </div>

                <p className="absolute bottom-10 text-center text-[#8B8478] text-sm font-body-aivice max-w-xs px-6">
                    Every invoice, written, calculated and chased — by your AI co-pilot.
                </p>
            </div>
        </div>
    );
}
