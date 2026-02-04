import React from "react";

export default function StepCard({ step, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs font-semibold uppercase text-emerald-200">Step {step}</p>
      <h4 className="mt-2 text-lg font-semibold text-white">{title}</h4>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
