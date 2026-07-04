import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Card, Btn } from "../../components/layout/AppShell";
import { StatusPill } from "../../components/shared/UI.jsx";
import { api, getUser } from "../../lib/api";

const fmt = (n, cur = "INR") => {
    const sym = cur === "INR" ? "₹" : "$";
    return sym + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
};

function StatCard({ label, value, sub, color = "#10B981", loading }) {
    return (
        <Card style={{ padding:"20px 22px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <span style={{ fontSize:13, color:"#6B7280", fontWeight:500 }}>{label}</span>
                <div style={{ width:36, height:36, borderRadius:10, background: color + "18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:14, height:14, borderRadius:3, background:color, opacity:0.8 }} />
                </div>
            </div>
            {loading
                ? <div style={{ height:32, width:100, background:"#F3F4F6", borderRadius:6 }} />
                : <div style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:4 }}>{value}</div>
            }
            <div style={{ fontSize:12, color:"#9CA3AF" }}>{sub}</div>
        </Card>
    );
}

export default function Dashboard() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = getUser() || {};
    const first = (user.name || "").split(" ")[0];

    useEffect(() => {
        Promise.all([api.get("/api/invoices"), api.get("/api/clients")])
            .then(([inv, cl]) => { setInvoices(inv || []); setClients(cl || []); })
            .finally(() => setLoading(false));
    }, []);

    const paid      = invoices.filter(i => i.status === "PAID");
    const pending   = invoices.filter(i => ["SENT","VIEWED"].includes(i.status));
    const overdue   = invoices.filter(i => i.status === "OVERDUE");
    const revenue   = paid.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const outstanding = pending.concat(overdue).reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const recent    = [...invoices].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,7);

    return (
        <div>
            <PageHeader
                title={first ? `Good day, ${first}` : "Overview"}
                subtitle="Here's a summary of your business"
                action={<Link to="/invoices/new"><Btn>+ New invoice</Btn></Link>}
            />

            <div style={{ padding:"24px 32px" }}>
                {overdue.length > 0 && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                            <span style={{ fontWeight:600, fontSize:13, color:"#991B1B" }}>{overdue.length} overdue invoice{overdue.length > 1 ? "s" : ""}</span>
                            <span style={{ fontSize:13, color:"#DC2626", marginLeft:8 }}>totalling {fmt(overdue.reduce((s,i) => s + Number(i.totalAmount||0), 0))}</span>
                        </div>
                        <Link to="/invoices?status=OVERDUE" style={{ fontSize:13, fontWeight:500, color:"#DC2626", textDecoration:"none" }}>View →</Link>
                    </div>
                )}

                <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:24 }}>
                    <StatCard label="Total revenue" value={fmt(revenue)} sub={`${paid.length} paid invoices`} color="#10B981" loading={loading} />
                    <StatCard label="Outstanding" value={fmt(outstanding)} sub={`${pending.length} awaiting payment`} color="#F59E0B" loading={loading} />
                    <StatCard label="Overdue" value={overdue.length} sub="need attention" color="#EF4444" loading={loading} />
                    <StatCard label="Total clients" value={clients.length} sub="on file" color="#6366F1" loading={loading} />
                </div>

                <Card>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid #F3F4F6", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <h2 style={{ fontSize:15, fontWeight:600, color:"#111827" }}>Recent invoices</h2>
                        <Link to="/invoices" style={{ fontSize:13, color:"#10B981", textDecoration:"none", fontWeight:500 }}>View all</Link>
                    </div>
                    {loading ? (
                        <div style={{ padding:"32px 20px", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Loading…</div>
                    ) : recent.length === 0 ? (
                        <div style={{ padding:"40px 20px", textAlign:"center" }}>
                            <p style={{ color:"#6B7280", fontSize:13, marginBottom:12 }}>No invoices yet.</p>
                            <Link to="/invoices/new"><Btn variant="secondary">Create your first invoice</Btn></Link>
                        </div>
                    ) : (
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                            <tr style={{ borderBottom:"1px solid #F3F4F6" }}>
                                {["Invoice #", "Client", "Issue date", "Due date", "Status", "Amount"].map(h => (
                                    <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {recent.map(inv => (
                                <tr key={inv.id} style={{ borderBottom:"1px solid #F9FAFB" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <td style={{ padding:"12px 20px" }}>
                                        <Link to={`/invoices/${inv.id}`} style={{ fontSize:13, fontWeight:500, color:"#10B981", textDecoration:"none" }}>{inv.invoiceNumber}</Link>
                                    </td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#374151" }}>{inv.clientName}</td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280" }}>{inv.issueDate}</td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280" }}>{inv.dueDate}</td>
                                    <td style={{ padding:"12px 20px" }}><StatusPill status={inv.status} /></td>
                                    <td style={{ padding:"12px 20px", fontSize:13, fontWeight:600, color:"#111827" }}>{fmt(inv.totalAmount, inv.currency)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}
