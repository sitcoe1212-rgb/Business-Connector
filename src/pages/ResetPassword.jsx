import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiPost } from "../api/client";

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await apiPost("/auth/forgot/reset", { reset_token: resetToken, new_password: password });
      setStatus({ type: "success", message: "Password updated successfully." });
      setPassword("");
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create a new password"
      subtitle="Use the reset token from OTP verification to finish the flow."
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
          <label className="text-xs uppercase tracking-wide text-slate-400">Reset token</label>
          <input
            className="input-base mt-2"
            value={resetToken}
            onChange={(event) => setResetToken(event.target.value)}
            placeholder="Paste reset token"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-slate-400">New password</label>
          <input
            className="input-base mt-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Min 8 characters"
            required
          />
        </div>
        <button className="button-primary w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Return to{" "}
        <Link to="/login" className="text-emerald-200 hover:text-emerald-100">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
