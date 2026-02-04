import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/auth/login", { identifier, password, role });
      login(data.user);
      setStatus({ type: "success", message: "Welcome back! Redirecting…" });
      setTimeout(() => nav("/dashboard"), 800);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your cooperative network insights."
    >
      <form onSubmit={submit} className="space-y-4">
        {status.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/40 bg-rose-500/10 text-rose-100"
            }`}
          >
            {status.message}
          </div>
        )}
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Role</label>
          <select
            className="input-base mt-2"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="farmer">Farmer</option>
            <option value="dealer">Dealer</option>
            <option value="government">Government</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Email or Username</label>
          <input
            className="input-base mt-2"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="ravi@collective.org"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Password</label>
          <input
            className="input-base mt-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="button-primary w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-between text-sm text-slate-400">
          <Link to="/forgot-password" className="hover:text-emerald-200">
            Forgot password?
          </Link>
          <Link to="/register" className="hover:text-emerald-200">
            Create account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
