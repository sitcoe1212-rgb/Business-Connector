import React from "react";

export default function TestimonialCard({ name, role, quote }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p className="text-sm text-slate-300">“{quote}”</p>
      <div className="mt-4">
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </div>
  );
}
