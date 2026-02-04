import React, { useState } from "react";
import { apiPost } from "../api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [role, setRole] = useState("farmer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try {
      const data = await apiPost("/login", { role, username, password });
      login(data.user);
      setMsg("Login success!");
      setTimeout(() => nav(`/${data.user.role}`), 600);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect w-full max-w-xl p-8">
        <h2 className="text-2xl font-bold gradient-text mb-6">Login</h2>

        {msg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{msg}</div>}
        {err && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{err}</div>}

        <form onSubmit={submit}>
          <label className="block mb-2 text-sm font-medium">Role *</label>
          <select className="input-fancy mb-4" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="farmer">Farmer</option>
            <option value="dealer">Dealer</option>
            <option value="admin">Admin</option>
            <option value="government">Government</option>
          </select>

          <label className="block mb-2 text-sm font-medium">Username *</label>
          <input className="input-fancy mb-4" value={username}
            onChange={(e) => setUsername(e.target.value)} />

          <label className="block mb-2 text-sm font-medium">Password *</label>
          <input type="password" className="input-fancy mb-6" value={password}
            onChange={(e) => setPassword(e.target.value)} />

          <button className="btn-gradient" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>

          {/* Forgot below login */}
          <div className="mt-4 text-center text-sm">
            <Link className="text-blue-600 hover:underline" to="/forgot">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <Link className="text-blue-600 hover:underline" to="/register">
              Create new account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
