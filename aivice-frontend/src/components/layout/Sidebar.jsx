import { NavLink } from "react-router-dom";
import { getUser, logoutFn } from "../../lib/api";

const NAV = [
    { to:"/dashboard", label:"Overview",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { to:"/clients",  label:"Clients",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { to:"/invoices", label:"Invoices",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { to:"/payments", label:"Payments",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
];

export default function Sidebar() {
    const user = getUser() || {};
    const initials = (user.name || user.email || "A").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

    return (
        <aside style={{
            width: 220, minHeight:"100vh", background:"#fff",
            borderRight:"1px solid #E5E7EB", display:"flex", flexDirection:"column",
            position:"sticky", top:0, flexShrink:0,
        }}>
            {/* Logo */}
            <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid #F3F4F6" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>A</span>
                    </div>
                    <div>
                        <div style={{ fontWeight:700, fontSize:15, color:"#111827" }}>Aivice</div>
                        <div style={{ fontSize:11, color:"#9CA3AF" }}>Invoicing</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex:1, padding:"16px 12px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", letterSpacing:"0.06em", textTransform:"uppercase", padding:"0 8px 8px" }}>
                    Menu
                </div>
                {NAV.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        style={({ isActive }) => ({
                            display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                            borderRadius:10, marginBottom:2, textDecoration:"none", fontSize:14, fontWeight:500,
                            transition:"all 0.15s",
                            background: isActive ? "#F0FDF4" : "transparent",
                            color: isActive ? "#059669" : "#6B7280",
                        })}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User */}
            <div style={{ padding:"12px 12px 20px", borderTop:"1px solid #F3F4F6" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"#F9FAFB", marginBottom:4 }}>
                    <div style={{ width:34, height:34, borderRadius:"50%", background:"#10B981", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ color:"#fff", fontWeight:600, fontSize:12 }}>{initials}</span>
                    </div>
                    <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name || "Account"}</div>
                        <div style={{ fontSize:11, color:"#9CA3AF", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</div>
                    </div>
                </div>
                <button
                    onClick={logoutFn}
                    style={{ width:"100%", padding:"8px 12px", border:"none", background:"transparent", cursor:"pointer", fontSize:13, color:"#6B7280", textAlign:"left", borderRadius:8, fontFamily:"'Inter', sans-serif" }}
                    onMouseEnter={e => e.target.style.color = "#DC2626"}
                    onMouseLeave={e => e.target.style.color = "#6B7280"}
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
