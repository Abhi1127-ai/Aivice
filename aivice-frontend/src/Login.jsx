import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import LedgerField from "../../components/auth/LedgerField";

const API_BASE = "http://localhost:8080";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Invalid email or password");
            }

            localStorage.setItem("aivice_token", data.token);
            localStorage.setItem(
                "aivice_user",
                JSON.stringify({ email: data.email, name: data.name })
            );

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to pick up where your invoices left off."
            footer={
                <>
                    New to Aivice?{" "}
                    <Link
                        to="/register"
                        className="text-[#15203B] font-medium underline underline-offset-2"
                    >
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <LedgerField
                    label="Email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@studio.com"
                />
                <LedgerField
                    label="Password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                />

                {error && (
                    <p className="mb-4 text-sm text-[#FF6B4A] font-body-aivice">{error}</p>
                )}

                <div className="flex items-center justify-end mb-6 text-sm">
                    <a href="#" className="text-[#8B8478] hover:text-[#15203B] transition-colors">
                        Forgot password?
                    </a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#15203B] text-[#FBF7EF] font-body-aivice font-medium py-3 rounded-sm hover:bg-[#FF6B4A] transition-colors disabled:opacity-60"
                >
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>
        </AuthLayout>
    );
}
