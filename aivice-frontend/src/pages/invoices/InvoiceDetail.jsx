import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader, Card, Btn } from "../../components/layout/AppShell";
import { StatusPill, Field, Drawer } from "../../components/shared/UI.jsx";
import { api, downloadPdf } from "../../lib/api";

const fmt = (n, cur="INR") => (cur==="INR"?"₹":"$") + Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2});

const FLOW = { DRAFT:["SENT"], SENT:["VIEWED","PAID"], VIEWED:["PAID"], OVERDUE:["PAID"], PAID:[], CANCELLED:[] };

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [payOpen, setPayOpen] = useState(false);
    const [payForm, setPayForm] = useState({ amount:"", paymentMethod:"UPI", notes:"" });
    const [paying, setPaying] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = () => {
        setLoading(true);
        api.get(`/api/invoices/${id}`)
            .then(inv => { setInvoice(inv); setPayForm(f => ({ ...f, amount: inv.totalAmount })); })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [id]);

    const changeStatus = async status => {
        setBusy(true);
        try { await api.patch(`/api/invoices/${id}/status`, { status }); load(); }
        catch(e) { alert(e.message); }
        finally { setBusy(false); }
    };

    const duplicate = async () => {
        setBusy(true);
        try { const c = await api.post(`/api/invoices/${id}/duplicate`, {}); navigate(`/invoices/${c.id}`); }
        catch(e) { alert(e.message); }
        finally { setBusy(false); }
    };

    const del = async () => {
        if (!confirm("Delete this invoice? This can't be undone.")) return;
        await api.delete(`/api/invoices/${id}`); navigate("/invoices");
    };

    const pdf = async () => {
        try { await downloadPdf(id, `${invoice.invoiceNumber}.pdf`); }
        catch(e) { alert(e.message); }
    };

    const recordPayment = async e => {
        e.preventDefault(); setPaying(true);
        try {
            await api.post("/api/payments/manual", { invoiceId:id, amount:Number(payForm.amount), currency:invoice.currency, paymentMethod:payForm.paymentMethod, notes:payForm.notes });
            setPayOpen(false); load();
        } catch(e) { alert(e.message); }
        finally { setPaying(false); }
    };

    if (loading) return <div style={{ padding:40, textAlign:"center", color:"#9CA3AF", fontSize:14 }}>Loading…</div>;
    if (!invoice) return <div style={{ padding:40, color:"#EF4444", fontSize:14 }}>Invoice not found.</div>;

    const next = FLOW[invoice.status] || [];

    return (
        <div>
            <PageHeader
                title={invoice.invoiceNumber}
                subtitle={`Issued ${invoice.issueDate} · Due ${invoice.dueDate}`}
                action={
                    <div style={{ display:"flex", gap:8 }}>
                        <Btn variant="secondary" onClick={pdf}>Download PDF</Btn>
                        <Link to={`/invoices/${id}/edit`}><Btn variant="secondary">Edit</Btn></Link>
                    </div>
                }
            >
                <div style={{ marginTop:8 }}><StatusPill status={invoice.status} /></div>
            </PageHeader>

            <div style={{ padding:"24px 32px", maxWidth:860 }}>
                {/* Actions */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
                    {next.map(s => (
                        <Btn key={s} onClick={() => changeStatus(s)} disabled={busy}>
                            Mark as {s.toLowerCase()}
                        </Btn>
                    ))}
                    {!["PAID","CANCELLED"].includes(invoice.status) && (
                        <Btn variant="secondary" onClick={() => setPayOpen(true)}>Record payment</Btn>
                    )}
                    <Btn variant="secondary" onClick={duplicate} disabled={busy}>Duplicate</Btn>
                    {invoice.status !== "PAID" && (
                        <Btn variant="danger" onClick={del}>Delete</Btn>
                    )}
                </div>

                {/* Billed to */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                    <Card style={{ padding:"20px 24px" }}>
                        <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Billed to</p>
                        <p style={{ fontSize:15, fontWeight:600, color:"#111827", marginBottom:2 }}>{invoice.clientName}</p>
                    </Card>
                    <Card style={{ padding:"20px 24px" }}>
                        <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Summary</p>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:13, color:"#6B7280" }}>Total due</span>
                            <span style={{ fontSize:16, fontWeight:700, color:"#10B981" }}>{fmt(invoice.totalAmount, invoice.currency)}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:13, color:"#6B7280" }}>Currency</span>
                            <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{invoice.currency}</span>
                        </div>
                    </Card>
                </div>

                {/* Line items */}
                <Card style={{ marginBottom:16, overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid #F3F4F6" }}>
                        <h3 style={{ fontSize:14, fontWeight:600, color:"#111827" }}>Line items</h3>
                    </div>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                        <thead>
                        <tr style={{ borderBottom:"1px solid #F3F4F6" }}>
                            {["Description","Qty","Unit price","Amount"].map(h => (
                                <th key={h} style={{ padding:"10px 20px", textAlign: h==="Description"?"left":"right", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {invoice.lineItems.map((li, i) => (
                            <tr key={i} style={{ borderBottom:"1px solid #F9FAFB" }}>
                                <td style={{ padding:"12px 20px", fontSize:13, color:"#374151" }}>{li.description}</td>
                                <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280", textAlign:"right" }}>{li.quantity}</td>
                                <td style={{ padding:"12px 20px", fontSize:13, color:"#6B7280", textAlign:"right" }}>{fmt(li.unitPrice, invoice.currency)}</td>
                                <td style={{ padding:"12px 20px", fontSize:13, fontWeight:600, color:"#111827", textAlign:"right" }}>{fmt(li.amount, invoice.currency)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div style={{ padding:"16px 20px", borderTop:"1px solid #F3F4F6", display:"flex", justifyContent:"flex-end" }}>
                        <div style={{ width:280 }}>
                            {[
                                { label:"Subtotal", val:fmt(invoice.subtotal, invoice.currency) },
                                ...(Number(invoice.discountAmount)>0 ? [{ label:`Discount (${invoice.discountPercent}%)`, val:"− "+fmt(invoice.discountAmount, invoice.currency) }] : []),
                                ...(Number(invoice.taxAmount)>0 ? [{ label:`Tax (${invoice.taxPercent}%)`, val:fmt(invoice.taxAmount, invoice.currency) }] : []),
                            ].map(row => (
                                <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#6B7280", marginBottom:8 }}>
                                    <span>{row.label}</span><span style={{ color:"#374151", fontWeight:500 }}>{row.val}</span>
                                </div>
                            ))}
                            <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:700, color:"#111827", paddingTop:10, borderTop:"1px solid #E5E7EB", marginTop:4 }}>
                                <span>Total due</span>
                                <span style={{ color:"#10B981" }}>{fmt(invoice.totalAmount, invoice.currency)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notes & Terms */}
                {(invoice.notes || invoice.terms) && (
                    <Card style={{ padding:"20px 24px" }}>
                        {invoice.notes && (
                            <div style={{ marginBottom:12 }}>
                                <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Notes</p>
                                <p style={{ fontSize:13, color:"#374151" }}>{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.terms && (
                            <div>
                                <p style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Terms</p>
                                <p style={{ fontSize:13, color:"#6B7280" }}>{invoice.terms}</p>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Payment drawer */}
            <Drawer open={payOpen} onClose={() => setPayOpen(false)} title="Record a payment">
                <form onSubmit={recordPayment}>
                    <Field label="Amount" type="number" name="amount" value={payForm.amount}
                           onChange={e => setPayForm({ ...payForm, amount:e.target.value })} required />
                    <Field label="Payment method" as="select" name="paymentMethod" value={payForm.paymentMethod}
                           onChange={e => setPayForm({ ...payForm, paymentMethod:e.target.value })}
                           options={["UPI","BANK_TRANSFER","CASH","CHEQUE"].map(v => ({ value:v, label:v.replace("_"," ") }))} />
                    <Field label="Notes" as="textarea" name="notes" value={payForm.notes}
                           onChange={e => setPayForm({ ...payForm, notes:e.target.value })} placeholder="e.g. Paid via Google Pay" />
                    <div style={{ display:"flex", gap:10, marginTop:8 }}>
                        <Btn type="submit" disabled={paying} style={{ flex:1, justifyContent:"center" }}>
                            {paying ? "Recording…" : "Record payment"}
                        </Btn>
                        <Btn variant="secondary" onClick={() => setPayOpen(false)}>Cancel</Btn>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}
