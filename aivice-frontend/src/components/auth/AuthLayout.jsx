import "../../styles/auth.css";

export default function AuthLayout({ title, subtitle, children, footer, isLogin }) {
    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#F3F4F6" }}>
            {/* Left green panel */}
            <div style={{
                width: "420px", minHeight: "100vh", background: "linear-gradient(160deg, #10B981 0%, #059669 100%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "48px 40px", position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
                {/* decorative circles */}
                <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", top:-80, left:-80 }} />
                <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.10)", bottom:-40, right:-60 }} />
                <div style={{ position:"absolute", width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.06)", bottom:80, left:30 }} />

                {/* Logo */}
                <div style={{ position:"absolute", top:32, left:36, display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ color:"#fff", fontWeight:700, fontSize:16 }}>A</span>
                    </div>
                    <span style={{ color:"#fff", fontWeight:600, fontSize:16 }}>Aivice</span>
                </div>

                {/* Central content */}
                <div style={{ textAlign:"center", position:"relative", zIndex:1 }}>
                    <div className="float" style={{
                        width:80, height:80, borderRadius:20, background:"rgba(255,255,255,0.15)",
                        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 32px",
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <h2 style={{ color:"#fff", fontSize:26, fontWeight:700, marginBottom:12 }}>
                        {isLogin ? "Welcome back!" : "Join Aivice"}
                    </h2>
                    <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, lineHeight:1.6, maxWidth:260, margin:"0 auto 36px" }}>
                        {isLogin
                            ? "Sign in to manage your invoices, clients, and payments — all in one place."
                            : "Create an account and send your first AI-powered invoice in minutes."}
                    </p>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"center" }}>
                        {[
                            { icon:"✦", text:"AI-generated invoice descriptions" },
                            { icon:"✦", text:"PDF export with one click" },
                            { icon:"✦", text:"Razorpay & Stripe payments" },
                        ].map(item => (
                            <div key={item.text} style={{ display:"flex", alignItems:"center", gap:10, color:"rgba(255,255,255,0.85)", fontSize:13 }}>
                                <span style={{ color:"rgba(255,255,255,0.6)", fontSize:10 }}>{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
                <div style={{ width:"100%", maxWidth:420 }}>
                    <div style={{ marginBottom:36 }}>
                        <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:6 }}>{title}</h1>
                        <p style={{ color:"#6B7280", fontSize:14 }}>{subtitle}</p>
                    </div>

                    {children}

                    <div style={{ marginTop:28, paddingTop:20, borderTop:"1px solid #E5E7EB", fontSize:14, color:"#6B7280", textAlign:"center" }}>
                        {footer}
                    </div>
                </div>
            </div>
        </div>
    );
}
