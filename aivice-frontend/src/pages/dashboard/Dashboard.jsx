import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../../components/layout/AppShell";
import StatusPill from "../../components/shared/StatusPill";
import { api, getCurrentUser } from "../../lib/api";

function formatMoney(amount, currency = "INR") {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Dashboard() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        Promise.all([api.get("/api/invoices"), api.get("/api/clients")])
            .then(([inv, cl]) => {
                setInvoices(inv || []);
                setClients(cl || []);
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const paidInvoices = invoices.filter((i) => i.status === "PAID");
    const outstandingInvoices = invoices.filter((i) => ["SENT", "VIEWED", "OVERDUE"].includes(i.status));
    const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE");

    const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    const outstanding = outstandingInvoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);

    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    const user = getCurrentUser() || {};
    const firstName = (user.name || "").split(" ")[0];

    return (
        <div>
            <PageHeader
                eyebrow="Aivice · Overview"
                title={firstName ? `Good to see you, ${firstName}` : "Overview"}
            />

            <div className="px-10 py-8">
                {error && (
                    <div className="mb-6 px-4 py-3 bg-[#FCEAE6] text-[#D14B2E] text-sm rounded-sm font-body-aivice">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                    <StatCard
                        label="Total revenue"
                        value={formatMoney(totalRevenue)}
                        caption={`from ${paidInvoices.length} paid invoice${paidInvoices.length === 1 ? "" : "s"}`}
                        loading={loading}
                    />
                    <StatCard
                        label="Outstanding"
                        value={formatMoney(outstanding)}
                        caption={`across ${outstandingInvoices.length} invoice${outstandingInvoices.length === 1 ? "" : "s"}`}
                        loading={loading}
                        accent="#C98A2E"
                    />
                    <StatCard label="Clients" value={clients.length} caption="on file" loading={loading} />
                </div>

                {overdueInvoices.length > 0 && (
                    <div className="mb-10 px-5 py-4 bg-[#FCEAE6] border border-[#F3C5B8] rounded-sm flex items-center justify-between fade-up">
                        <div>
                            <p className="font-body-aivice text-sm font-medium text-[#15203B]">
                                {overdueInvoices.length} invoice{overdueInvoices.length > 1 ? "s" : ""} overdue
                            </p>
                            <p className="font-body-aivice text-sm text-[#8B8478] mt-0.5">
                                Worth {formatMoney(overdueInvoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0))} — a nudge might help.
                            </p>
                        </div>
                        <Link
                            to="/invoices?status=OVERDUE"
                            className="font-body-aivice text-sm font-medium text-[#D14B2E] underline underline-offset-2 whitespace-nowrap"
                        >
                            Review now
                        </Link>
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl text-[#15203B]">Recent invoices</h2>
                    <Link
                        to="/invoices"
                        className="font-mono-aivice text-xs tracking-wide uppercase text-[#8B8478] hover:text-[#15203B] transition-colors"
                    >
                        View all →
                    </Link>
                </div>

                <div className="bg-white border border-[#E4DFD3] rounded-sm overflow-hidden">
                    {loading ? (
                        <div className="px-5 py-10 text-center text-[#8B8478] font-body-aivice text-sm">
                            Loading invoices…
                        </div>
                    ) : recentInvoices.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="font-body-aivice text-sm text-[#8B8478] mb-3">
                                No invoices yet — your first one is one click away.
                            </p>
                            <Link to="/invoices/new" className="font-body-aivice text-sm font-medium text-[#15203B] underline underline-offset-2">
                                Create an invoice
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b border-[#E4DFD3] font-mono-aivice text-[10px] tracking-wide uppercase text-[#8B8478]">
                                <th className="px-5 py-3">Invoice</th>
                                <th className="px-5 py-3">Client</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentInvoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-[#F0EDE3] last:border-0 hover:bg-[#FBF7EF] transition-colors">
                                    <td className="px-5 py-3.5">
                                        <Link to={`/invoices/${inv.id}`} className="font-mono-aivice text-sm text-[#15203B] hover:underline">
                                            {inv.invoiceNumber}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5 font-body-aivice text-sm text-[#15203B]">{inv.clientName}</td>
                                    <td className="px-5 py-3.5">
                                        <StatusPill status={inv.status} />
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-mono-aivice text-sm text-[#15203B]">
                                        {formatMoney(inv.totalAmount, inv.currency)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, caption, loading, accent = "#15203B" }) {
    return (
        <div className="bg-white border border-[#E4DFD3] rounded-sm p-5 fade-up">
            <p className="font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-3">{label}</p>
            {loading ? (
                <div className="h-8 w-24 bg-[#F3EEE2] rounded-sm animate-pulse" />
            ) : (
                <p className="font-display text-3xl" style={{ color: accent }}>
                    {value}
                </p>
            )}
            <p className="font-body-aivice text-xs text-[#8B8478] mt-2">{caption}</p>
        </div>
    );
}
