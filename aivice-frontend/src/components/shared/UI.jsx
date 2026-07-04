// ── StatusPill ────────────────────────────────────────────────────────────────
const PILL = {
    DRAFT:     { bg:"#F3F4F6", color:"#6B7280", dot:"#9CA3AF" },
    SENT:      { bg:"#EFF6FF", color:"#1D4ED8", dot:"#3B82F6" },
    VIEWED:    { bg:"#FAF5FF", color:"#7C3AED", dot:"#8B5CF6" },
    PAID:      { bg:"#F0FDF4", color:"#15803D", dot:"#22C55E" },
    OVERDUE:   { bg:"#FEF2F2", color:"#DC2626", dot:"#EF4444" },
    CANCELLED: { bg:"#F9FAFB", color:"#9CA3AF", dot:"#D1D5DB" },
};

export function StatusPill({ status }) {
    const s = PILL[status] || PILL.DRAFT;
    return (
        <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, background:s.bg, color:s.color, fontSize:12, fontWeight:500 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
            {status}
    </span>
    );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, name, value, onChange, type="text", placeholder, required, as="input", options=[], rows=3 }) {
    const base = {
        width:"100%", padding:"0 12px", height:38, border:"1.5px solid #E5E7EB",
        borderRadius:9, fontSize:13, color:"#111827", background:"#F9FAFB",
        outline:"none", fontFamily:"'Inter', sans-serif",
    };
    return (
        <div style={{ marginBottom:14 }}>
            {label && <label style={{ display:"block", fontSize:12, fontWeight:500, color:"#374151", marginBottom:5 }}>{label}</label>}
            {as === "select" ? (
                <select name={name} value={value} onChange={onChange} required={required} style={{ ...base, height:38 }}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : as === "textarea" ? (
                <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows}
                          style={{ ...base, height:"auto", padding:"10px 12px", resize:"vertical" }} />
            ) : (
                <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} style={base} />
            )}
        </div>
    );
}

// ── Drawer ────────────────────────────────────────────────────────────────────
export function Drawer({ open, onClose, title, children, width=440 }) {
    if (!open) return null;
    return (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", justifyContent:"flex-end" }}>
            <div style={{ position:"absolute", inset:0, background:"rgba(17,24,39,0.35)" }} onClick={onClose} />
            <div style={{ position:"relative", width, maxWidth:"95vw", background:"#fff", height:"100%", overflow:"auto", boxShadow:"-4px 0 24px rgba(0,0,0,0.12)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:"1px solid #E5E7EB", position:"sticky", top:0, background:"#fff", zIndex:1 }}>
                    <h2 style={{ fontSize:16, fontWeight:600, color:"#111827" }}>{title}</h2>
                    <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#9CA3AF", lineHeight:1 }}>×</button>
                </div>
                <div style={{ padding:"24px" }}>{children}</div>
            </div>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ message, action }) {
    return (
        <div style={{ textAlign:"center", padding:"56px 24px" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <p style={{ fontSize:14, color:"#6B7280", marginBottom:12 }}>{message}</p>
            {action}
        </div>
    );
}
