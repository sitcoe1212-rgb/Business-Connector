import React, { useState } from "react";
import { apiPost } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const reset_token = params.get("reset_token") || "";

  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!reset_token) return setErr("Missing reset token");
    if (newPass.length < 4) return setErr("Password too short");
    if (newPass !== confirm) return setErr("Passwords not match");

    setLoading(true);
    try {
      await apiPost("/forgot/reset", { reset_token, new_password: newPass });
      setMsg("Password updated successfully. Redirecting to login...");
      setTimeout(() => nav("/login"), 1200);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect w-full max-w-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Set New Password</h2>

        {msg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{msg}</div>}
        {err && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{err}</div>}

        <form onSubmit={submit}>
          <label className="block mb-2 text-sm font-medium">New Password *</label>
          <input type="password" className="input-fancy mb-4" value={newPass} onChange={(e) => setNewPass(e.target.value)} />

          <label className="block mb-2 text-sm font-medium">Confirm Password *</label>
          <input type="password" className="input-fancy mb-6" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          <button className="btn-gradient" disabled={loading}>
            {loading ? "Updating..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
