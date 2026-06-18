const API_BASE = "http://localhost:8080";

function getToken() {
    return localStorage.getItem("aivice_token");
}

async function request(path, options = {}) {
    const token = getToken();

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem("aivice_token");
        localStorage.removeItem("aivice_user");
        window.location.href = "/login";
        throw new Error("Session expired");
    }

    if (res.status === 204) return null;

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : null;

    if (!res.ok) {
        throw new Error(data?.error || "Something went wrong");
    }

    return data;
}

export const api = {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (path) => request(path, { method: "DELETE" }),
};

export async function downloadPdf(invoiceId, filename) {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/invoice-pdf/${invoiceId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "invoice.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

export function getCurrentUser() {
    const raw = localStorage.getItem("aivice_user");
    return raw ? JSON.parse(raw) : null;
}

export function logout() {
    localStorage.removeItem("aivice_token");
    localStorage.removeItem("aivice_user");
    window.location.href = "/login";
}
