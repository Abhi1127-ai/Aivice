import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader, Card, Btn } from "../../components/layout/AppShell";
import { Field } from "../../components/shared/UI.jsx";
import LineItemRow from "./LineItemRow";
import { api } from "../../lib/api";

const emptyItem = () => ({ description: "", quantity: 1, unitPrice: "" });

export default function InvoiceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        clientId: "", issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "", currency: "INR", taxPercent: 18, discountPercent: 0,
        notes: "Thank you for your business!", terms: "Payment due within the agreed terms.",
    });
    const [items, setItems] = useState([emptyItem()]);
    const [aiLoading, setAiLoading] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/clients").then(d => setClients(d || []));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        api.get(`/api/invoices/${id}`).then(inv => {
            setForm({ clientId:inv.clientId, issueDate:inv.issueDate, dueDate:inv.dueDate, currency:inv.currency, taxPercent:inv.taxPercent, discountPercent:inv.discountPercent, notes:inv.notes||"", terms:inv.terms||"" });
            setItems(inv.lineItems.map(li => ({ description:li.description, quantity:li.quantity, unitPrice:li.unitPrice })));
        });
    }, [id, isEdit]);

    const ch = e => setForm({ ...form, [e.target.name]: e.target.value });
    const itemCh = (i, field, val) => { const n=[...items]; n[i][field]=val; setItems(n); };
    const addItem = () => setItems([...items, emptyItem()]);
    const removeItem = i => items.length > 1 ? setItems(items.filter((_,idx)=>idx!==i)) : null;

    const aiImprove = async i => {
        setAiLoading(i);
        try {
            const res = await api.post("/api/ai/generate-description", { rawInput: items[i].description, tone:"professional", industry:"software" });
            itemCh(i, "description", res.improved);
        } catch(e) { alert(e.message); }
        finally { setAiLoading(null); }
    };

    const subtotal = items.reduce((s,it) => s + Number(it.quantity||0)*Number(it.unitPrice||0), 0);
    const disc     = subtotal * Number(form.discountPercent||0) / 100;
    const tax      = (subtotal - disc) * Number(form.taxPercent||0) / 100;
    const total    = subtotal - disc + tax;
    const sym      = form.currency === "INR" ? "₹" : "$";

    const submit = async e => {
        e.preventDefault(); setError("");
        if (!form.clientId) { setError("Please select a client."); return; }
        if (items.some(it => !it.description || !it.unitPrice)) { setError("All line items need a description and price."); return; }
        setSaving(true);
        try {
            const payload = { ...form, taxPercent:Number(form.taxPercent), discountPercent:Number(form.discountPercent),
                lineItems: items.map(it => ({ description:it.description, quantity:Number(it.quantity), unitPrice:Number(it.unitPrice) })) };
            const result = isEdit ? await api.put(`/api/invoices/${id}`, payload) : await api.post("/api/invoices", payload);
            navigate(`/invoices/${isEdit ? id : result.id}`);
        } catch(err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <div>
            <PageHeader title={isEdit ? "Edit invoice" : "New invoice"} subtitle="Fill in the details below" />
            <div style={{ padding:"24px 32px", maxWidth:860 }}>
                {error && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:13, color:"#DC2626" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* Client & currency */}
                    <Card style={{ padding:"20px 24px", marginBottom:16 }}>
                        <h3 style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:16 }}>Invoice details</h3>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                            <Field label="Client *" as="select" name="clientId" value={form.clientId} onChange={ch} required
                                   options={[{value:"",label:"Select a client…"}, ...clients.map(c=>({value:c.id,label:c.companyName}))]} />
                            <Field label="Currency" as="select" name="currency" value={form.currency} onChange={ch}
                                   options={[{value:"INR",label:"INR (₹)"},{value:"USD",label:"USD ($)"}]} />
                            <Field label="Issue date *" type="date" name="issueDate" value={form.issueDate} onChange={ch} required />
                            <Field label="Due date *" type="date" name="dueDate" value={form.dueDate} onChange={ch} required />
                        </div>
                    </Card>

                    {/* Line items */}
                    <Card style={{ padding:"20px 24px", marginBottom:16 }}>
                        <h3 style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:16 }}>Line items</h3>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 70px 120px 100px 32px", gap:8, marginBottom:8 }}>
                            {["Description","Qty","Unit price","Amount",""].map(h => (
                                <div key={h} style={{ fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</div>
                            ))}
                        </div>
                        {items.map((item, i) => (
                            <LineItemRow key={i} item={item} index={i} onChange={itemCh} onRemove={removeItem}
                                         onAiImprove={aiImprove} aiLoading={aiLoading} currency={form.currency} />
                        ))}
                        <button type="button" onClick={addItem} style={{
                            background:"none", border:"1.5px dashed #D1D5DB", borderRadius:8, cursor:"pointer",
                            padding:"8px 16px", fontSize:13, color:"#6B7280", width:"100%", marginTop:4,
                            fontFamily:"'Inter', sans-serif",
                        }}>
                            + Add line item
                        </button>
                    </Card>

                    {/* Tax, discount, totals */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:16 }}>
                        <Card style={{ padding:"20px 24px" }}>
                            <h3 style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:16 }}>Notes & terms</h3>
                            <Field label="Notes (shown on invoice)" as="textarea" name="notes" value={form.notes} onChange={ch} rows={3} />
                            <Field label="Terms & conditions" as="textarea" name="terms" value={form.terms} onChange={ch} rows={2} />
                        </Card>

                        <Card style={{ padding:"20px 24px" }}>
                            <h3 style={{ fontSize:14, fontWeight:600, color:"#111827", marginBottom:16 }}>Summary</h3>
                            <Field label="Discount %" type="number" name="discountPercent" value={form.discountPercent} onChange={ch} />
                            <Field label="Tax / GST %" type="number" name="taxPercent" value={form.taxPercent} onChange={ch} />

                            <div style={{ borderTop:"1px solid #F3F4F6", paddingTop:14, marginTop:4 }}>
                                {[
                                    { label:"Subtotal", val: sym+subtotal.toFixed(2) },
                                    ...(Number(form.discountPercent)>0 ? [{ label:`Discount (${form.discountPercent}%)`, val:"− "+sym+disc.toFixed(2) }] : []),
                                    ...(Number(form.taxPercent)>0 ? [{ label:`Tax (${form.taxPercent}%)`, val: sym+tax.toFixed(2) }] : []),
                                ].map(row => (
                                    <div key={row.label} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#6B7280", marginBottom:8 }}>
                                        <span>{row.label}</span><span style={{ fontWeight:500, color:"#374151" }}>{row.val}</span>
                                    </div>
                                ))}
                                <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:700, color:"#111827", paddingTop:10, borderTop:"1px solid #E5E7EB", marginTop:4 }}>
                                    <span>Total due</span>
                                    <span style={{ color:"#10B981" }}>{sym}{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div style={{ display:"flex", gap:12 }}>
                        <Btn type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}</Btn>
                        <Btn variant="secondary" onClick={() => navigate("/invoices")}>Cancel</Btn>
                    </div>
                </form>
            </div>
        </div>
    );
}
