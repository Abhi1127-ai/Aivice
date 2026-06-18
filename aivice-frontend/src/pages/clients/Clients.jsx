import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "../../components/layout/AppShell";
import { PrimaryButton } from "../../components/shared/Form";
import Drawer from "../../components/shared/Drawer";
import ClientForm from "./ClientForm";
import { api } from "../../lib/api";

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [error, setError] = useState("");

    const load = useCallback(() => {
        setLoading(true);
        const path = search ? `/api/clients?search=${encodeURIComponent(search)}` : "/api/clients";
        api
            .get(path)
            .then((data) => setClients(data || []))
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [search]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const openCreate = () => {
        setEditingClient(null);
        setDrawerOpen(true);
    };

    const openEdit = (client) => {
        setEditingClient(client);
        setDrawerOpen(true);
    };

    const handleSaved = () => {
        setDrawerOpen(false);
        load();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this client? This can't be undone.")) return;
        try {
            await api.delete(`/api/clients/${id}`);
            load();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow={`Aivice · ${clients.length} on file`}
                title="Clients"
                action={<PrimaryButton onClick={openCreate}>+ Add client</PrimaryButton>}
            />

            <div className="px-10 py-8">
                <input
                    type="text"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-sm mb-6 bg-white border border-[#D8D1C2] rounded-sm px-3 py-2.5 text-sm font-body-aivice placeholder:text-[#C7C0B2] focus:outline-none focus:border-[#15203B] transition-colors"
                />

                {error && (
                    <div className="mb-6 px-4 py-3 bg-[#FCEAE6] text-[#D14B2E] text-sm rounded-sm font-body-aivice">
                        {error}
                    </div>
                )}

                <div className="bg-white border border-[#E4DFD3] rounded-sm overflow-hidden">
                    {loading ? (
                        <div className="px-5 py-10 text-center text-[#8B8478] font-body-aivice text-sm">
                            Loading clients…
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                            <p className="font-body-aivice text-sm text-[#8B8478] mb-3">
                                {search ? "No clients match that search." : "No clients yet — add your first one to get started."}
                            </p>
                            {!search && (
                                <button onClick={openCreate} className="font-body-aivice text-sm font-medium text-[#15203B] underline underline-offset-2">
                                    Add a client
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b border-[#E4DFD3] font-mono-aivice text-[10px] tracking-wide uppercase text-[#8B8478]">
                                <th className="px-5 py-3">Company</th>
                                <th className="px-5 py-3">Contact</th>
                                <th className="px-5 py-3">Terms</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {clients.map((c) => (
                                <tr key={c.id} className="border-b border-[#F0EDE3] last:border-0 hover:bg-[#FBF7EF] transition-colors group">
                                    <td className="px-5 py-3.5">
                                        <p className="font-body-aivice text-sm font-medium text-[#15203B]">{c.companyName}</p>
                                        <p className="font-body-aivice text-xs text-[#8B8478]">{c.email}</p>
                                    </td>
                                    <td className="px-5 py-3.5 font-body-aivice text-sm text-[#15203B]">{c.contactName || "—"}</td>
                                    <td className="px-5 py-3.5 font-mono-aivice text-xs text-[#8B8478]">{c.paymentTerms || "—"}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <button
                                            onClick={() => openEdit(c)}
                                            className="font-body-aivice text-xs text-[#8B8478] hover:text-[#15203B] mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="font-body-aivice text-xs text-[#8B8478] hover:text-[#D14B2E] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingClient ? "Edit client" : "Add client"}>
                <ClientForm client={editingClient} onSaved={handleSaved} onCancel={() => setDrawerOpen(false)} />
            </Drawer>
        </div>
    );
}
