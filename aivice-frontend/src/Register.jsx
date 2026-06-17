import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import LedgerField from "../../components/auth/LedgerField";

const API_BASE = "http://localhost:8080";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Could not create account");
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
            title="Create your account"
            subtitle="Set up Aivice and send your first AI-written invoice in minutes."
            footer={
                <>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#15203B] font-medium underline underline-offset-2"
                    >
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <LedgerField
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Abhishek Yadav"
                />
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
                    placeholder="At least 8 characters"
                />
                <LedgerField
                    label="Confirm password"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                />

                {error && (
                    <p className="mb-4 text-sm text-[#FF6B4A] font-body-aivice">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#15203B] text-[#FBF7EF] font-body-aivice font-medium py-3 rounded-sm hover:bg-[#FF6B4A] transition-colors disabled:opacity-60"
                >
                    {loading ? "Creating account…" : "Create account"}
                </button>

                <p className="mt-4 text-xs text-[#8B8478] leading-relaxed">
                    By creating an account, you agree to receive invoice and payment
                    notifications by email.
                </p>
            </form>
        </AuthLayout>
    );
}
