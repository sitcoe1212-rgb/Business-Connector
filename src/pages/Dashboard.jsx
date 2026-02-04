import React from "react";
import { Calendar, MapPin, Sprout, TrendingUp } from "lucide-react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";

const insights = [
  {
    title: "Next pickup window",
    meta: "Thu, 18 May · 8:00 AM",
    icon: <Calendar size={18} />,
  },
  {
    title: "Cluster readiness",
    meta: "Kolhapur · 86% harvest ready",
    icon: <MapPin size={18} />,
  },
  {
    title: "Crop focus",
    meta: "Sugarcane · 12k MT forecast",
    icon: <Sprout size={18} />,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <Navbar />
        <section className="py-8">
          <h1 className="text-3xl font-semibold">Network dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Monitor your cooperative’s next actions and live procurement signals.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard value="₹42.8L" label="Active deals" />
          <StatCard value="67" label="Verified farmers online" />
          <StatCard value="14" label="Pending advisories" />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">Today’s insights</h2>
            <div className="mt-4 space-y-4">
              {insights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.meta}</p>
                    </div>
                  </div>
                  <TrendingUp size={18} className="text-emerald-200" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-slate-900/60 to-slate-950 p-6">
            <h2 className="text-lg font-semibold">Upcoming actions</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• Review dealer demand requests for the week.</li>
              <li>• Send SMS advisory on post-harvest storage.</li>
              <li>• Sync with district office on subsidy distribution.</li>
            </ul>
            <button className="button-primary mt-6 w-full">Plan outreach</button>
          </div>
        </section>
      </div>
    </div>
  );
}
