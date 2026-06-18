import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/AppShell";
import { PrimaryButton, SecondaryButton, Field } from "../../components/shared/Form";
import StatusPill from "../../components/shared/StatusPill";
import Drawer from "../../components/shared/Drawer";
import { api, downloadPdf } from "../../lib/api";

function formatMoney(amount, currency = "INR") {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const STATUS_FLOW = {
    DRAFT: ["SENT"],
    SENT: ["VIEWED", "PAID"],
    VIEWED: ["PAID"],
    OVERDUE: ["PAID"],
    PAID: [],
    CANCELLED: [],
};

export default function InvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ amount: "", paymentMethod: "UPI", notes: "" });
    const [savingPayment, setSavingPayment] = useState(false);
    const [busyAction, setBusyAction] = useState(false);

    const load = () => {
        setLoading(true);
        api
            .get(`/api/invoices/${id}`)
            .then((inv) => {
                setInvoice(inv);
                setPaymentForm((f) => ({ ...f, amount: inv.totalAmount }));
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleStatusChange = async (status) => {
        setBusyAction(true);
        try {
            await api.patch(`/api/invoices/${id}/status`, { status });
            load();
        } catch (e) {
            alert(e.message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleDuplicate = async () => {
        setBusyAction(true);
        try {
            const copy = await api.post(`/api/invoices/${id}/duplicate`, {});
            navigate(`/invoices/${copy.id}`);
        } catch (e) {
            alert(e.message);
        } finally {
            setBusyAction(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this invoice? This can't be undone.")) return;
        try {
            await api.delete(`/api/invoices/${id}`);
            navigate("/invoices");
        } catch (e) {
            alert(e.message);
        }
    };

    const handleDownload = async () => {
        try {
            await downloadPdf(id, `${invoice.invoiceNumber}.pdf`);
        } catch (e) {
            alert(e.message);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setSavingPayment(true);
        try {
            await api.post("/api/payments/manual", {
                invoiceId: id,
                amount: Number(paymentForm.amount),
                currency: invoice.currency,
                paymentMethod: paymentForm.paymentMethod,
                notes: paymentForm.notes,
            });
            setPaymentOpen(false);
            load();
        } catch (e) {
            alert(e.message);
        } finally {
            setSavingPayment(false);
        }
    };

    if (loading) {
        return <div className="px-10 py-10 font-body-aivice text-sm text-[#8B8478]">Loading invoice…</div>;
    }

    if (error || !invoice) {
        return (
            <div className="px-10 py-10 font-body-aivice text-sm text-[#D14B2E]">
                {error || "Invoice not found."}
            </div>
        );
    }

    const nextStatuses = STATUS_FLOW[invoice.status] || [];

    return (
        <div>
            <PageHeader
                eyebrow="Aivice · Invoice"
                title={invoice.invoiceNumber}
                action={
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handleDownload}>Download PDF</SecondaryButton>
                        <Link to={`/invoices/${id}/edit`}>
                            <SecondaryButton>Edit</SecondaryButton>
                        </Link>
                    </div>
                }
            />

            <div className="px-10 py-8 max-w-3xl">
                <div className="flex items-center gap-3 mb-8">
                    <StatusPill status={invoice.status} />
                    <span className="font-body-aivice text-sm text-[#8B8478]">
            Issued {invoice.issueDate} · Due {invoice.dueDate}
          </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {nextStatuses.map((status) => (
                        <PrimaryButton key={status} onClick={() => handleStatusChange(status)} disabled={busyAction}>
                            Mark as {status.toLowerCase()}
                        </PrimaryButton>
                    ))}
                    {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                        <SecondaryButton onClick={() => setPaymentOpen(true)}>Record payment</SecondaryButton>
                    )}
                    <SecondaryButton onClick={handleDuplicate} disabled={busyAction}>
                        Duplicate
                    </SecondaryButton>
                    {invoice.status !== "PAID" && (
                        <button
                            onClick={handleDelete}
                            className="font-body-aivice text-sm text-[#8B8478] hover:text-[#D14B2E] transition-colors px-2"
                        >
                            Delete
                        </button>
                    )}
                </div>

                <div className="bg-white border border-[#E4DFD3] rounded-sm p-5 mb-6">
                    <p className="font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-2">Billed to</p>
                    <p className="font-display text-lg text-[#15203B]">{invoice.clientName}</p>
                </div>

                <div className="bg-white border border-[#E4DFD3] rounded-sm overflow-hidden mb-6">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="border-b border-[#E4DFD3] font-mono-aivice text-[10px] tracking-wide uppercase text-[#8B8478]">
                            <th className="px-5 py-3">Description</th>
                            <th className="px-5 py-3 text-center">Qty</th>
                            <th className="px-5 py-3 text-right">Unit price</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {invoice.lineItems.map((item, i) => (
                            <tr key={i} className="border-b border-[#F0EDE3] last:border-0">
                                <td className="px-5 py-3.5 font-body-aivice text-sm text-[#15203B]">{item.description}</td>
                                <td className="px-5 py-3.5 text-center font-mono-aivice text-sm text-[#8B8478]">{item.quantity}</td>
                                <td className="px-5 py-3.5 text-right font-mono-aivice text-sm text-[#8B8478]">
                                    {formatMoney(item.unitPrice, invoice.currency)}
                                </td>
                                <td className="px-5 py-3.5 text-right font-mono-aivice text-sm text-[#15203B]">
                                    {formatMoney(item.amount, invoice.currency)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white border border-[#E4DFD3] rounded-sm p-5 max-w-sm mb-8 font-body-aivice text-sm ml-auto">
                    <div className="flex justify-between mb-2 text-[#8B8478]">
                        <span>Subtotal</span>
                        <span className="font-mono-aivice text-[#15203B]">{formatMoney(invoice.subtotal, invoice.currency)}</span>
                    </div>
                    {Number(invoice.discountAmount) > 0 && (
                        <div className="flex justify-between mb-2 text-[#8B8478]">
                            <span>Discount ({invoice.discountPercent}%)</span>
                            <span className="font-mono-aivice text-[#15203B]">− {formatMoney(invoice.discountAmount, invoice.currency)}</span>
                        </div>
                    )}
                    {Number(invoice.taxAmount) > 0 && (
                        <div className="flex justify-between mb-2 text-[#8B8478]">
                            <span>Tax ({invoice.taxPercent}%)</span>
                            <span className="font-mono-aivice text-[#15203B]">{formatMoney(invoice.taxAmount, invoice.currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-3 mt-2 border-t border-dashed border-[#D8D1C2] font-display text-lg text-[#15203B]">
                        <span>Total due</span>
                        <span className="font-mono-aivice">{formatMoney(invoice.totalAmount, invoice.currency)}</span>
                    </div>
                </div>

                {invoice.notes && (
                    <div className="mb-4">
                        <p className="font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-1.5">Notes</p>
                        <p className="font-body-aivice text-sm text-[#15203B]">{invoice.notes}</p>
                    </div>
                )}
                {invoice.terms && (
                    <div>
                        <p className="font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-1.5">Terms</p>
                        <p className="font-body-aivice text-sm text-[#8B8478]">{invoice.terms}</p>
                    </div>
                )}
            </div>

            <Drawer open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record a payment">
                <form onSubmit={handleRecordPayment}>
                    <Field
                        label="Amount"
                        type="number"
                        name="amount"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                        required
                    />
                    <Field
                        label="Payment method"
                        as="select"
                        name="paymentMethod"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                        options={[
                            { value: "UPI", label: "UPI" },
                            { value: "BANK_TRANSFER", label: "Bank transfer" },
                            { value: "CASH", label: "Cash" },
                            { value: "CHEQUE", label: "Cheque" },
                        ]}
                    />
                    <Field
                        label="Notes"
                        as="textarea"
                        name="notes"
                        value={paymentForm.notes}
                        onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                        placeholder="Paid via Google Pay"
                    />
                    <div className="flex gap-3 mt-6">
                        <PrimaryButton type="submit" disabled={savingPayment} className="flex-1">
                            {savingPayment ? "Recording…" : "Record payment"}
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPaymentOpen(false)} disabled={savingPayment}>
                            Cancel
                        </SecondaryButton>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}
