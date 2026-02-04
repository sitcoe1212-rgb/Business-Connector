import React, { useState } from "react";
import { apiPost } from "../api";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [role, setRole] = useState("farmer");
  const [username, setUsername] = useState("");

  const [step, setStep] = useState("form"); // form | otp
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await apiPost("/forgot/initiate", { role, username });
      setToken(data.token);
      setStep("otp");
      setMsg("OTP sent to your registered phone number.");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await apiPost("/forgot/verify", { token, otp });
      setMsg("OTP verified. Redirecting...");
      setTimeout(() => nav(`/set-password?reset_token=${encodeURIComponent(data.reset_token)}`), 700);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect w-full max-w-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Forgot Password</h2>

        {msg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{msg}</div>}
        {err && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{err}</div>}

        {step === "form" && (
          <form onSubmit={sendOtp}>
            <label className="block mb-2 text-sm font-medium">Role *</label>
            <select className="input-fancy mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="farmer">Farmer</option>
              <option value="dealer">Dealer</option>
            </select>

            <label className="block mb-2 text-sm font-medium">Username *</label>
            <input className="input-fancy mb-6" value={username} onChange={(e) => setUsername(e.target.value)} />

            <button className="btn-gradient" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp}>
            <label className="block mb-2 text-sm font-medium">OTP *</label>
            <input className="input-fancy mb-6" value={otp} onChange={(e) => setOtp(e.target.value)} />

            <button className="btn-gradient" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
