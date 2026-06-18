const STYLES = {
    DRAFT:     { bg: "#F3EEE2", text: "#8B8478" },
    SENT:      { bg: "#EFF3FA", text: "#3B5FA3" },
    VIEWED:    { bg: "#F3EEFA", text: "#7654B3" },
    PAID:      { bg: "#EAF6EE", text: "#2F9E5B" },
    OVERDUE:   { bg: "#FCEAE6", text: "#D14B2E" },
    CANCELLED: { bg: "#F0F0F0", text: "#9A9A9A" },
};

export default function StatusPill({ status }) {
    const style = STYLES[status] || STYLES.DRAFT;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono-aivice text-[10px] tracking-wide uppercase"
            style={{ backgroundColor: style.bg, color: style.text }}
        >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.text }} />
            {status}
    </span>
    );
}
