import React, { useState } from "react";
import { apiPost } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    role: "farmer",
    username: "",
    password: "",
    full_name: "",
    phone: "",
  });

  const [step, setStep] = useState("form"); // form | otp
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const requiresOtp = form.role === "farmer" || form.role === "dealer";

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function submitRegister(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);

    try {
      const data = await apiPost("/register/initiate", form);

      // if otp required -> show otp input section same page
      if (data.otp_required) {
        setToken(data.token);
        setStep("otp");
        setMsg("OTP sent to your phone.");
      } else {
        setMsg("Registered successfully. Redirecting to login...");
        setTimeout(() => nav("/login"), 1200);
      }
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
      await apiPost("/register/verify", { token, otp });
      setMsg("Registered successfully. Redirecting to login...");
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
        <h2 className="text-2xl font-bold gradient-text mb-6">Register</h2>

        {msg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{msg}</div>}
        {err && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{err}</div>}

        {/* FORM */}
        <form onSubmit={submitRegister} className={step === "form" ? "block" : "hidden"}>
          <label className="block mb-2 text-sm font-medium">Role</label>
          <select
            className="input-fancy mb-4"
            value={form.role}
            onChange={(e) => onChange("role", e.target.value)}
          >
            <option value="farmer">Farmer</option>
            <option value="dealer">Dealer</option>
            <option value="admin">Admin (No OTP)</option>
            <option value="government">Government (No OTP)</option>
          </select>

          <label className="block mb-2 text-sm font-medium">Username *</label>
          <input className="input-fancy mb-4" value={form.username}
            onChange={(e) => onChange("username", e.target.value)} placeholder="username" />

          <label className="block mb-2 text-sm font-medium">Password *</label>
          <input type="password" className="input-fancy mb-4" value={form.password}
            onChange={(e) => onChange("password", e.target.value)} placeholder="password" />

          <label className="block mb-2 text-sm font-medium">Full Name</label>
          <input className="input-fancy mb-4" value={form.full_name}
            onChange={(e) => onChange("full_name", e.target.value)} placeholder="full name" />

          <label className="block mb-2 text-sm font-medium">
            Phone {requiresOtp ? "*" : "(optional)"}
          </label>
          <input className="input-fancy mb-6" value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)} placeholder="10 digit mobile" />

          <button className="btn-gradient" disabled={loading}>
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>

        {/* OTP SECTION (SAME PAGE) */}
        <form onSubmit={verifyOtp} className={step === "otp" ? "block" : "hidden"}>
          <div className="mb-3 text-gray-700">
            Enter OTP sent to <b>{form.phone}</b>
          </div>

          <label className="block mb-2 text-sm font-medium">OTP</label>
          <input className="input-fancy mb-6" value={otp}
            onChange={(e) => setOtp(e.target.value)} placeholder="6 digit OTP" />

          <button className="btn-gradient" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP & Finish Register"}
          </button>

          <button
            type="button"
            className="mt-3 w-full p-3 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => { setStep("form"); setOtp(""); setToken(""); setMsg(""); setErr(""); }}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
