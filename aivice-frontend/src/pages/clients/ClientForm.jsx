import { useState, useEffect } from "react";
import { Field, PrimaryButton, SecondaryButton } from "../../components/shared/Form";
import { api } from "../../lib/api";

const empty = {
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    gstNumber: "",
    billingAddress: "",
    city: "",
    country: "",
    paymentTerms: "Net 30",
    currency: "INR",
    notes: "",
};

export default function ClientForm({ client, onSaved, onCancel }) {
    const [form, setForm] = useState(empty);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(client ? { ...empty, ...client } : empty);
    }, [client]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            if (client?.id) {
                await api.put(`/api/clients/${client.id}`, form);
            } else {
                await api.post("/api/clients", form);
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Field label="Company name" name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Acme Technologies" />
            <Field label="Contact name" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Raj Sharma" />
            <Field label="Email" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="raj@acme.com" />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+91-9876543210" />
            <Field label="GST number" name="gstNumber" value={form.gstNumber} onChange={handleChange} placeholder="27AAPFU0939F1ZV" />
            <Field label="Billing address" as="textarea" name="billingAddress" value={form.billingAddress} onChange={handleChange} placeholder="123 Business Park, Andheri" />
            <div className="grid grid-cols-2 gap-3">
                <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                <Field label="Country" name="country" value={form.country} onChange={handleChange} placeholder="India" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Payment terms"
                    as="select"
                    name="paymentTerms"
                    value={form.paymentTerms}
                    onChange={handleChange}
                    options={[
                        { value: "Due on receipt", label: "Due on receipt" },
                        { value: "Net 15", label: "Net 15" },
                        { value: "Net 30", label: "Net 30" },
                        { value: "Net 45", label: "Net 45" },
                    ]}
                />
                <Field
                    label="Currency"
                    as="select"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    options={[
                        { value: "INR", label: "INR (₹)" },
                        { value: "USD", label: "USD ($)" },
                    ]}
                />
            </div>
            <Field label="Notes" as="textarea" name="notes" value={form.notes} onChange={handleChange} placeholder="Preferred client, pays on time" />

            {error && <p className="mb-4 text-sm text-[#D14B2E] font-body-aivice">{error}</p>}

            <div className="flex gap-3 mt-6">
                <PrimaryButton type="submit" disabled={saving} className="flex-1">
                    {saving ? "Saving…" : client?.id ? "Save changes" : "Add client"}
                </PrimaryButton>
                <SecondaryButton onClick={onCancel} disabled={saving}>
                    Cancel
                </SecondaryButton>
            </div>
        </form>
    );
}
