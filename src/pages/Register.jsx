import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    role: "farmer",
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function requestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/auth/register/initiate", form);
      setToken(data.token);
      setStatus({ type: "success", message: "OTP sent. Enter the code to verify." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await apiPost("/auth/register/verify", { token, otp });
      setStatus({ type: "success", message: "Account created! You can now login." });
      setOtp("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start onboarding your cooperative with verified access."
    >
      <form onSubmit={requestOtp} className="space-y-4">
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
            name="role"
            value={form.role}
            onChange={updateField}
          >
            <option value="farmer">Farmer</option>
            <option value="dealer">Dealer</option>
            <option value="government">Government</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">Full name</label>
          <input
            className="input-base mt-2"
            name="full_name"
            value={form.full_name}
            onChange={updateField}
            placeholder="Ravi Deshmukh"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">Username</label>
            <input
              className="input-base mt-2"
              name="username"
              value={form.username}
              onChange={updateField}
              placeholder="ravi_d"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">Email</label>
            <input
              className="input-base mt-2"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="ravi@collective.org"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">Phone</label>
            <input
              className="input-base mt-2"
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="+91 98765 43210"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">Password</label>
            <input
              className="input-base mt-2"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Min 8 characters"
              required
            />
          </div>
        </div>
        <button className="button-primary w-full" disabled={loading}>
          {loading ? "Sending OTP…" : "Send verification code"}
        </button>
      </form>

      {token && (
        <form onSubmit={verifyOtp} className="mt-6 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-400">OTP code</label>
            <input
              className="input-base mt-2"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter 6-digit code"
              required
            />
          </div>
          <button className="button-secondary w-full" disabled={loading}>
            {loading ? "Verifying…" : "Verify & create account"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-emerald-200 hover:text-emerald-100">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
