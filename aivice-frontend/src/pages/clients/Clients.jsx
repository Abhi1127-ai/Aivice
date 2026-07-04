import { useEffect, useState, useCallback } from "react";
import { PageHeader, Card, Btn } from "../../components/layout/AppShell";
import { Field, Drawer, Empty } from "../../components/shared/UI.jsx";
import { api } from "../../lib/api";

// ── Client Form ────────────────────────────────────────────────────────────────
function ClientForm({ client, onSaved, onCancel }) {
    const empty = { companyName:"", contactName:"", email:"", phone:"", gstNumber:"", billingAddress:"", city:"", country:"India", paymentTerms:"Net 30", currency:"INR", notes:"" };
    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { setForm(client ? { ...empty, ...client } : empty); }, [client]);

    const ch = e => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault(); setError(""); setSaving(true);
        try {
            client?.id ? await api.put(`/api/clients/${client.id}`, form) : await api.post("/api/clients", form);
            onSaved();
        } catch(err) { setError(err.message); }
        finally { setSaving(false); }
    };

    return (
        <form onSubmit={submit}>
            <Field label="Company name *" name="companyName" value={form.companyName} onChange={ch} placeholder="Acme Technologies" required />
            <Field label="Contact name" name="contactName" value={form.contactName} onChange={ch} placeholder="Raj Sharma" />
            <Field label="Email *" type="email" name="email" value={form.email} onChange={ch} placeholder="raj@acme.com" required />
            <Field label="Phone" name="phone" value={form.phone} onChange={ch} placeholder="+91 98765 43210" />
            <Field label="GST number" name="gstNumber" value={form.gstNumber} onChange={ch} placeholder="27AAPFU0939F1ZV" />
            <Field label="Billing address" as="textarea" name="billingAddress" value={form.billingAddress} onChange={ch} placeholder="123 Business Park, Andheri" rows={2} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="City" name="city" value={form.city} onChange={ch} placeholder="Mumbai" />
                <Field label="Country" name="country" value={form.country} onChange={ch} placeholder="India" />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Payment terms" as="select" name="paymentTerms" value={form.paymentTerms} onChange={ch}
                       options={["Due on receipt","Net 15","Net 30","Net 45"].map(v => ({ value:v, label:v }))} />
                <Field label="Currency" as="select" name="currency" value={form.currency} onChange={ch}
                       options={[{value:"INR",label:"INR (₹)"},{value:"USD",label:"USD ($)"}]} />
            </div>
            <Field label="Notes" as="textarea" name="notes" value={form.notes} onChange={ch} rows={2} />
            {error && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:13, color:"#DC2626" }}>{error}</div>}
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
                <Btn type="submit" disabled={saving} style={{ flex:1, justifyContent:"center" }}>{saving ? "Saving…" : client?.id ? "Save changes" : "Add client"}</Btn>
                <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
            </div>
        </form>
    );
}

// ── Clients Page ───────────────────────────────────────────────────────────────
export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        const path = search ? `/api/clients?search=${encodeURIComponent(search)}` : "/api/clients";
        api.get(path).then(d => setClients(d || [])).finally(() => setLoading(false));
    }, [search]);

    useEffect(() => { const t = setTimeout(load, 280); return () => clearTimeout(t); }, [load]);

    const openAdd  = () => { setEditing(null); setOpen(true); };
    const openEdit = c  => { setEditing(c); setOpen(true); };
    const onSaved  = () => { setOpen(false); load(); };
    const del = async id => {
        if (!confirm("Delete this client? This can't be undone.")) return;
        await api.delete(`/api/clients/${id}`); load();
    };

    return (
        <div>
            <PageHeader title="Clients" subtitle={`${clients.length} on file`} action={<Btn onClick={openAdd}>+ Add client</Btn>} />
            <div style={{ padding:"24px 32px" }}>
                <div style={{ marginBottom:16 }}>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        style={{ width:300, height:38, padding:"0 14px", border:"1.5px solid #E5E7EB", borderRadius:9, fontSize:13, outline:"none", fontFamily:"'Inter', sans-serif", background:"#fff" }}
                    />
                </div>
                <Card>
                    {loading ? (
                        <div style={{ padding:"32px", textAlign:"center", color:"#9CA3AF", fontSize:13 }}>Loading…</div>
                    ) : clients.length === 0 ? (
                        <Empty message={search ? "No clients match your search." : "No clients yet — add your first one."} action={!search && <Btn onClick={openAdd}>Add client</Btn>} />
                    ) : (
                        <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                            <tr style={{ borderBottom:"1px solid #F3F4F6" }}>
                                {["Company","Contact","Email","Terms",""].map(h => (
                                    <th key={h} style={{ padding:"10px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {clients.map(c => (
                                <tr key={c.id} style={{ borderBottom:"1px solid #F9FAFB" }}
                                    onMouseEnter={e => e.currentTarget.style.background="#FAFAFA"}
                                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                                    <td style={{ padding:"13px 20px" }}>
                                        <div style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{c.companyName}</div>
                                    </td>
                                    <td style={{ padding:"13px 20px", fontSize:13, color:"#374151" }}>{c.contactName || "—"}</td>
                                    <td style={{ padding:"13px 20px", fontSize:13, color:"#6B7280" }}>{c.email}</td>
                                    <td style={{ padding:"13px 20px" }}>
                                        <span style={{ fontSize:12, background:"#F3F4F6", color:"#6B7280", padding:"3px 10px", borderRadius:20 }}>{c.paymentTerms || "—"}</span>
                                    </td>
                                    <td style={{ padding:"13px 20px", textAlign:"right" }}>
                                        <button onClick={() => openEdit(c)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#10B981", marginRight:12, fontFamily:"'Inter', sans-serif" }}>Edit</button>
                                        <button onClick={() => del(c.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#EF4444", fontFamily:"'Inter', sans-serif" }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
            <Drawer open={open} onClose={() => setOpen(false)} title={editing ? "Edit client" : "Add client"}>
                <ClientForm client={editing} onSaved={onSaved} onCancel={() => setOpen(false)} />
            </Drawer>
        </div>
    );
}
