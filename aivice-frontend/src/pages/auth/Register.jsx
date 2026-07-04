import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import InputField from "../../components/auth/InputField";
import { setUser } from "../../lib/api";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name:"", email:"", password:"", confirmPassword:"" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault(); setError("");
        if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/register", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");
            setUser({ name: data.name, email: data.email }, data.token);
            navigate("/dashboard");
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Get started with Aivice — it's free"
            footer={<>Already have an account? <Link to="/login" style={{ color:"#10B981", fontWeight:500 }}>Sign in</Link></>}
        >
            <form onSubmit={onSubmit}>
                <InputField label="Full name" name="name" value={form.name} onChange={onChange} placeholder="Abhishek Yadav" required icon="👤" />
                <InputField label="Email address" type="email" name="email" value={form.email} onChange={onChange} placeholder="you@example.com" required icon="✉" />
                <InputField label="Password" type="password" name="password" value={form.password} onChange={onChange} placeholder="At least 8 characters" required icon="🔒" />
                <InputField label="Confirm password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={onChange} placeholder="Repeat password" required icon="🔒" />

                {error && (
                    <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#DC2626" }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit" disabled={loading}
                    style={{
                        width:"100%", height:46, borderRadius:10, border:"none", cursor:"pointer",
                        background: loading ? "#6EE7B7" : "#10B981", color:"#fff",
                        fontSize:15, fontWeight:600, fontFamily:"'Inter', sans-serif",
                        transition:"background 0.15s",
                    }}
                    onMouseEnter={e => { if(!loading) e.target.style.background = "#059669"; }}
                    onMouseLeave={e => { if(!loading) e.target.style.background = "#10B981"; }}
                >
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>
        </AuthLayout>
    );
}
