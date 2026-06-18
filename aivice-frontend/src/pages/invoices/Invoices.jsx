import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "../../components/layout/AppShell";
import { PrimaryButton } from "../../components/shared/Form";
import StatusPill from "../../components/shared/StatusPill";
import { api, downloadPdf } from "../../lib/api";

const TABS = ["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"];

function formatMoney(amount, currency = "INR") {
    const symbol = currency === "INR" ? "₹" : "$";
    return `${symbol}${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Invoices() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("status") || "ALL";

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        setLoading(true);
        const path = activeTab === "ALL" ? "/api/invoices" : `/api/invoices?status=${activeTab}`;
        api
            .get(path)
            .then((data) => setInvoices(data || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [activeTab]);

    useEffect(() => {
        load();
    }, [load]);

    const setTab = (tab) => {
        if (tab === "ALL") setSearchParams({});
        else setSearchParams({ status: tab });
    };

    const handleDownload = async (inv) => {
        try {
            await downloadPdf(inv.id, `${inv.invoiceNumber}.pdf`);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow={`Aivice · ${invoices.length} showing`}
                title="Invoices"
                action={
                    <Link to="/invoices/new">
                        <PrimaryButton>+ New invoice</PrimaryButton>
                    </Link>
                }
            />

            <div className="px-10 py-8">
                <div className="flex gap-1 mb-6 border-b border-[#E4DFD3]">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setTab(tab)}
                            className={`px-4 py-2.5 font-body-aivice text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab ? "border-[#15203B] text-[#15203B]" : "border-transparent text-[#8B8478] hover:text-[#15203B]"
                            }`}
                        >
                            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-[#FCEAE6] text-[#D14B2E] text-sm rounded-sm font-body-aivice">
                        {error}
                    </div>
                )}

                <div className="bg-white border border-[#E4DFD3] rounded-sm overflow-hidden">
                    {loading ? (
                        <div className="px-5 py-10 text-center text-[#8B8478] font-body-aivice text-sm">
                            Loading invoices…
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="font-body-aivice text-sm text-[#8B8478] mb-3">Nothing here yet.</p>
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
                                <th className="px-5 py-3">Due</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Amount</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-[#F0EDE3] last:border-0 hover:bg-[#FBF7EF] transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <Link to={`/invoices/${inv.id}`} className="font-mono-aivice text-sm text-[#15203B] hover:underline">
                                            {inv.invoiceNumber}
                                        </Link>
                                    </td>
                                    <td className="px-5 py-3.5 font-body-aivice text-sm text-[#15203B]">{inv.clientName}</td>
                                    <td className="px-5 py-3.5 font-body-aivice text-sm text-[#8B8478]">{inv.dueDate}</td>
                                    <td className="px-5 py-3.5">
                                        <StatusPill status={inv.status} />
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-mono-aivice text-sm text-[#15203B]">
                                        {formatMoney(inv.totalAmount, inv.currency)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => handleDownload(inv)}
                                            className="font-body-aivice text-xs text-[#8B8478] hover:text-[#15203B] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            PDF
                                        </button>
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
