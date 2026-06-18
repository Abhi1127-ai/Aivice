import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../styles/app.css";

export function AppShell({ children }) {
    return (
        <div className="flex min-h-screen bg-[#FBF7EF]">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
    );
}

export function ProtectedRoute({ children }) {
    const token = localStorage.getItem("aivice_token");
    if (!token) return <Navigate to="/login" replace />;
    return <AppShell>{children}</AppShell>;
}

export function PageHeader({ eyebrow, title, action }) {
    return (
        <div className="flex items-start justify-between px-10 pt-10 pb-6 border-b border-[#E4DFD3]">
            <div>
                {eyebrow && (
                    <p className="font-mono-aivice text-[10px] tracking-[0.2em] uppercase text-[#8B8478] mb-2">
                        {eyebrow}
                    </p>
                )}
                <h1 className="font-display text-3xl text-[#15203B]">{title}</h1>
            </div>
            {action}
        </div>
    );
}
