import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/AppShell";
import { Field, PrimaryButton, SecondaryButton } from "../../components/shared/Form";
import LineItemRow from "./LineItemRow";
import { api } from "../../lib/api";

const emptyItem = () => ({ description: "", quantity: 1, unitPrice: "" });

export default function InvoiceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        clientId: "",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        currency: "INR",
        taxPercent: 18,
        discountPercent: 0,
        notes: "Thank you for your business!",
        terms: "Payment due within the agreed terms.",
    });
    const [items, setItems] = useState([emptyItem()]);
    const [aiLoadingIndex, setAiLoadingIndex] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loadingClients, setLoadingClients] = useState(true);

    useEffect(() => {
        api
            .get("/api/clients")
            .then((data) => setClients(data || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoadingClients(false));
    }, []);

    useEffect(() => {
        if (!isEdit) return;
        api.get(`/api/invoices/${id}`).then((inv) => {
            setForm({
                clientId: inv.clientId,
                issueDate: inv.issueDate,
                dueDate: inv.dueDate,
                currency: inv.currency,
                taxPercent: inv.taxPercent,
                discountPercent: inv.discountPercent,
                notes: inv.notes || "",
                terms: inv.terms || "",
            });
            setItems(
                inv.lineItems.map((li) => ({
                    description: li.description,
                    quantity: li.quantity,
                    unitPrice: li.unitPrice,
                }))
            );
        });
    }, [id, isEdit]);

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleItemChange = (index, field, value) => {
        const next = [...items];
        next[index][field] = value;
        setItems(next);
    };

    const addItem = () => setItems([...items, emptyItem()]);
    const removeItem = (index) => setItems(items.length > 1 ? items.filter((_, i) => i !== index) : items);

    const handleAiImprove = async (index) => {
        setAiLoadingIndex(index);
        try {
            const res = await api.post("/api/ai/generate-description", {
                rawInput: items[index].description,
                tone: "professional",
                industry: "software",
            });
            handleItemChange(index, "description", res.improved);
        } catch (e) {
            alert(e.message || "AI couldn't improve this just now — try again in a moment.");
        } finally {
            setAiLoadingIndex(null);
        }
    };

    const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
    const discountAmount = (subtotal * Number(form.discountPercent || 0)) / 100;
    const taxAmount = ((subtotal - discountAmount) * Number(form.taxPercent || 0)) / 100;
    const total = subtotal - discountAmount + taxAmount;
    const symbol = form.currency === "INR" ? "₹" : "$";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.clientId) {
            setError("Pick a client before saving.");
            return;
        }
        if (items.some((it) => !it.description || !it.unitPrice)) {
            setError("Every line item needs a description and a price.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                taxPercent: Number(form.taxPercent),
                discountPercent: Number(form.discountPercent),
                lineItems: items.map((it) => ({
                    description: it.description,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                })),
            };

            if (isEdit) {
                await api.put(`/api/invoices/${id}`, payload);
                navigate(`/invoices/${id}`);
            } else {
                const created = await api.post("/api/invoices", payload);
                navigate(`/invoices/${created.id}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <PageHeader eyebrow="Aivice · Invoice" title={isEdit ? "Edit invoice" : "New invoice"} />

            <form onSubmit={handleSubmit} className="px-10 py-8 max-w-3xl">
                {error && (
                    <div className="mb-6 px-4 py-3 bg-[#FCEAE6] text-[#D14B2E] text-sm rounded-sm font-body-aivice">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-2">
                    <Field
                        label="Client"
                        as="select"
                        name="clientId"
                        value={form.clientId}
                        onChange={handleFormChange}
                        required
                        options={[
                            { value: "", label: loadingClients ? "Loading…" : "Select a client" },
                            ...clients.map((c) => ({ value: c.id, label: c.companyName })),
                        ]}
                    />
                    <Field
                        label="Currency"
                        as="select"
                        name="currency"
                        value={form.currency}
                        onChange={handleFormChange}
                        options={[
                            { value: "INR", label: "INR (₹)" },
                            { value: "USD", label: "USD ($)" },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <Field label="Issue date" type="date" name="issueDate" value={form.issueDate} onChange={handleFormChange} required />
                    <Field label="Due date" type="date" name="dueDate" value={form.dueDate} onChange={handleFormChange} required />
                </div>

                <div className="mb-2">
                    <div className="grid grid-cols-[1fr_70px_110px_100px_28px] gap-3 mb-2 font-mono-aivice text-[10px] tracking-wide uppercase text-[#8B8478]">
                        <span>Description</span>
                        <span className="text-center">Qty</span>
                        <span className="text-right">Unit price</span>
                        <span className="text-right">Amount</span>
                        <span></span>
                    </div>
                    {items.map((item, i) => (
                        <LineItemRow
                            key={i}
                            item={item}
                            index={i}
                            onChange={handleItemChange}
                            onRemove={removeItem}
                            onAiImprove={handleAiImprove}
                            aiLoading={aiLoadingIndex}
                            currency={form.currency}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addItem}
                    className="font-body-aivice text-sm font-medium text-[#15203B] underline underline-offset-2 mb-8"
                >
                    + Add line item
                </button>

                <div className="grid grid-cols-2 gap-4 mb-2 max-w-sm">
                    <Field label="Discount %" type="number" name="discountPercent" value={form.discountPercent} onChange={handleFormChange} />
                    <Field label="Tax / GST %" type="number" name="taxPercent" value={form.taxPercent} onChange={handleFormChange} />
                </div>

                <div className="bg-white border border-[#E4DFD3] rounded-sm p-5 max-w-sm mb-8 font-body-aivice text-sm">
                    <div className="flex justify-between mb-2 text-[#8B8478]">
                        <span>Subtotal</span>
                        <span className="font-mono-aivice text-[#15203B]">{symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    {Number(form.discountPercent) > 0 && (
                        <div className="flex justify-between mb-2 text-[#8B8478]">
                            <span>Discount ({form.discountPercent}%)</span>
                            <span className="font-mono-aivice text-[#15203B]">− {symbol}{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {Number(form.taxPercent) > 0 && (
                        <div className="flex justify-between mb-2 text-[#8B8478]">
                            <span>Tax ({form.taxPercent}%)</span>
                            <span className="font-mono-aivice text-[#15203B]">{symbol}{taxAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-3 mt-2 border-t border-dashed border-[#D8D1C2] font-display text-lg text-[#15203B]">
                        <span>Total due</span>
                        <span className="font-mono-aivice">{symbol}{total.toFixed(2)}</span>
                    </div>
                </div>

                <Field label="Notes (shown on invoice)" as="textarea" name="notes" value={form.notes} onChange={handleFormChange} />
                <Field label="Terms & conditions" as="textarea" name="terms" value={form.terms} onChange={handleFormChange} />

                <div className="flex gap-3 mt-6">
                    <PrimaryButton type="submit" disabled={saving}>
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Create invoice"}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => navigate("/invoices")} disabled={saving}>
                        Cancel
                    </SecondaryButton>
                </div>
            </form>
        </div>
    );
}
