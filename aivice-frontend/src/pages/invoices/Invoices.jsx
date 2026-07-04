import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader, Card, Btn } from "../../components/layout/AppShell";
import { StatusPill, Empty } from "../../components/shared/UI.jsx";
import { api, downloadPdf } from "../../lib/api";

const TABS = ["ALL","DRAFT","SENT","VIEWED","PAID","OVERDUE"];
const fmt = (n, cur="INR") => (cur==="INR"?"₹":"$") + Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:0});

export default function Invoices() {
    const [params, setParams] = useSearchParams();
    const tab = params.get("status") || "ALL";
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading]   = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        const path = tab === "ALL" ? "/api/invoices" : `/api/invoices?status=${tab}`;
        api.get(path).then(d => setInvoices(d||[])).finally(() => setLoading(false));
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    const setTab = t => t === "ALL" ? setParams({}) : setParams({ status: t });

    const handlePdf = async inv => {
        try { await downloadPdf(inv.id, `${inv.invoiceNumber}.pdf`); }
        catch(e) { alert(e.message); }
    };

    return (
        <div>
            <PageHeader
                title="Invoices"
                subtitle={`${invoices.length} showing`}
                action={<Link to="/invoices/new"><Btn>+ New invoice</Btn></Link>}
            />

            <div style={{ padding:"24px 32px" }}>
                {/* Status tabs */}
                <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid #E5E7EB", paddingBottom:0 }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding:"8px 16px", border:"none", background:"transparent", cursor:"pointer",
                            fontSize:13, fontWeight:500, fontFamily:"'Inter', sans-serif",
                            color: tab===t ? "#10B981" : "#6B7280",
                            borderBottom: tab===t ? "2px solid #10B981" : "2px solid transparent",
                            marginBottom:-1, transition:"color 0.15s",
                        }}>
                            {t === "ALL" ? "All" : t.charAt(0)+t.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                <Card>
                    {loading ? (
                        <div style={{ padding:"32px", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Loading…</div>
                    ) : invoices.length === 0 ? (
                        <Empty
                            message="No invoices here yet."
                            action={<Link to="/invoices/new"><Btn variant="secondary">Create an invoice</Btn></Link>}
                        />
                    ) : (
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                            <tr style={{ borderBottom:"1px solid #F3F4F6" }}>
                                {["Invoice #","Client","Issue date","Due date","Status","Amount",""].map(h => (
                                    <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} style={{ borderBottom:"1px solid #F9FAFB" }}
                                    onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                                    <td style={{ padding:"12px 20px" }}>
                                        <Link to={`/invoices/${inv.id}`} style={{ fontSize:13, fontWeight:600, color:"#10B981", textDecoration:"none" }}>{inv.invoiceNumber}</Link>
                                    </td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#374151" }}>{inv.clientName}</td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280" }}>{inv.issueDate}</td>
                                    <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280" }}>{inv.dueDate}</td>
                                    <td style={{ padding:"12px 20px" }}><StatusPill status={inv.status} /></td>
                                    <td style={{ padding:"12px 20px", fontSize:13, fontWeight:600, color:"#111827" }}>{fmt(inv.totalAmount, inv.currency)}</td>
                                    <td style={{ padding:"12px 20px", textAlign:"right" }}>
                                        <button onClick={() => handlePdf(inv)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#6B7280", fontFamily:"'Inter', sans-serif" }}>
                                            PDF
                                        </button>
                                    </td>
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
