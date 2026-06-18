import { NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/api";

const navItems = [
    { to: "/dashboard", label: "Overview" },
    { to: "/clients", label: "Clients" },
    { to: "/invoices", label: "Invoices" },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const user = getCurrentUser() || {};
    const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

    const handleLogout = () => {
        logout();
    };

    return (
        <aside className="w-60 shrink-0 bg-[#15203B] flex flex-col h-screen sticky top-0">
            <div className="px-6 py-7 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-sm bg-[#FF6B4A] flex items-center justify-center">
                    <span className="font-mono-aivice text-[#15203B] text-xs font-bold">A</span>
                </div>
                <span className="font-display text-[#FBF7EF] text-lg">Aivice</span>
            </div>

            <nav className="flex-1 px-4 mt-2">
                {navItems.map((item, i) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 mb-1 rounded-sm transition-colors font-body-aivice text-sm ${
                                isActive
                                    ? "bg-[#FBF7EF] text-[#15203B] font-medium"
                                    : "text-[#A9AFC0] hover:bg-white/5 hover:text-[#FBF7EF]"
                            }`
                        }
                    >
            <span className="font-mono-aivice text-[10px] opacity-50">
              {String(i + 1).padStart(2, "0")}
            </span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 pb-6">
                <div className="flex items-center gap-3 px-3 py-3 rounded-sm bg-white/5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B4A] flex items-center justify-center shrink-0">
                        <span className="font-mono-aivice text-xs font-bold text-[#15203B]">{initial}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#FBF7EF] text-sm font-medium truncate font-body-aivice">
                            {user.name || "Account"}
                        </p>
                        <p className="text-[#8B8478] text-xs truncate font-body-aivice">{user.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-[#A9AFC0] hover:text-[#FF6B4A] transition-colors font-body-aivice"
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
