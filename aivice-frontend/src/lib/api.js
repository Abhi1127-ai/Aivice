const BASE = "http://localhost:8080";

const token = () => localStorage.getItem("aivice_token");

async function req(path, opts = {}) {
    const t = token();
    const res = await fetch(`${BASE}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(t ? { Authorization: `Bearer ${t}` } : {}),
            ...opts.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("aivice_token");
        localStorage.removeItem("aivice_user");
        window.location.href = "/login";
        throw new Error("Session expired");
    }
    if (res.status === 204) return null;

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await res.json() : null;
    if (!res.ok) throw new Error(data?.error || "Something went wrong");
    return data;
}

export const api = {
    get:    (p)    => req(p, { method: "GET" }),
    post:   (p, b) => req(p, { method: "POST",  body: JSON.stringify(b) }),
    put:    (p, b) => req(p, { method: "PUT",   body: JSON.stringify(b) }),
    patch:  (p, b) => req(p, { method: "PATCH", body: JSON.stringify(b) }),
    delete: (p)    => req(p, { method: "DELETE" }),
};

export async function downloadPdf(id, filename) {
    const t = token();
    const res = await fetch(`${BASE}/api/invoice-pdf/${id}/pdf`, {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename || "invoice.pdf";
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
}

export const getUser   = () => { const r = localStorage.getItem("aivice_user"); return r ? JSON.parse(r) : null; };
export const setUser   = (u, t) => { localStorage.setItem("aivice_token", t); localStorage.setItem("aivice_user", JSON.stringify(u)); };
export const logoutFn  = () => { localStorage.removeItem("aivice_token"); localStorage.removeItem("aivice_user"); window.location.href = "/login"; };
