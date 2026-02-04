import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold">
            Business Connector
          </Link>
          <Link to="/" className="text-sm text-emerald-200 hover:text-emerald-100">
            Back to home
          </Link>
        </header>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-slate-950 p-10">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <p className="mt-3 text-sm text-slate-300">{subtitle}</p>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <p>✔ Secure OTP verification for phone-based access.</p>
              <p>✔ Centralized dashboards for farmers, dealers, and agencies.</p>
              <p>✔ Real-time insights to plan supply and demand.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
