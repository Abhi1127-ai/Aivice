import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../styles/app.css";

export function AppShell({ children }) {
    return (
        <div style={{ display:"flex", minHeight:"100vh", background:"#F3F4F6" }}>
            <Sidebar />
            <main style={{ flex:1, minWidth:0, overflow:"auto" }}>{children}</main>
        </div>
    );
}

export function ProtectedRoute({ children }) {
    if (!localStorage.getItem("aivice_token")) return <Navigate to="/login" replace />;
    return <AppShell>{children}</AppShell>;
}

export function PageHeader({ title, subtitle, action, children }) {
    return (
        <div style={{ padding:"28px 32px 20px", background:"#fff", borderBottom:"1px solid #E5E7EB", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
                <h1 style={{ fontSize:20, fontWeight:700, color:"#111827", marginBottom:2 }}>{title}</h1>
                {subtitle && <p style={{ fontSize:13, color:"#6B7280" }}>{subtitle}</p>}
                {children}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function Card({ children, style = {} }) {
    return (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", ...style }}>
            {children}
        </div>
    );
}

export function Btn({ children, onClick, type="button", variant="primary", disabled, style={} }) {
    const base = {
        display:"inline-flex", alignItems:"center", gap:6, padding:"0 18px", height:38,
        borderRadius:9, border:"none", cursor:disabled?"not-allowed":"pointer",
        fontSize:13, fontWeight:600, fontFamily:"'Inter', sans-serif",
        transition:"background 0.15s, opacity 0.15s", opacity: disabled ? 0.55 : 1, ...style,
    };
    const variants = {
        primary:   { background:"#10B981", color:"#fff" },
        secondary: { background:"#F3F4F6", color:"#374151", border:"1px solid #E5E7EB" },
        danger:    { background:"#FEF2F2", color:"#DC2626", border:"1px solid #FCA5A5" },
        ghost:     { background:"transparent", color:"#6B7280" },
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
            {children}
        </button>
    );
}
