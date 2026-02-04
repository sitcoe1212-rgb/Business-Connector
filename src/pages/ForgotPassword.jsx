import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../api/client";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [role, setRole] = useState("farmer");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function requestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const data = await apiPost("/auth/forgot/initiate", { identifier, role });
      setToken(data.token);
      setStatus({ type: "success", message: "OTP sent. Verify to continue." });
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
      const data = await apiPost("/auth/forgot/verify", { token, otp });
      setResetToken(data.reset_token);
      setStatus({ type: "success", message: "OTP verified. Set a new password." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Verify your identity and create a new password securely."
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
        <button className="button-primary w-full" disabled={loading}>
          {loading ? "Sending OTP…" : "Send OTP"}
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
            {loading ? "Verifying…" : "Verify OTP"}
          </button>
        </form>
      )}

      {resetToken && (
        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          OTP verified. Continue to{" "}
          <Link to="/reset-password" className="font-semibold underline">
            set a new password
          </Link>{" "}
          with your reset token.
        </div>
      )}
    </AuthLayout>
  );
}
