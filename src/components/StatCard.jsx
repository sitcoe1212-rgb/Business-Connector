import React from "react";

export default function StatCard({ value, label }) {
  return (
    <div className="glass-panel rounded-2xl px-6 py-5 text-center">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
