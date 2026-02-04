import React from "react";

export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="glass-panel rounded-2xl p-6 card-shadow">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
