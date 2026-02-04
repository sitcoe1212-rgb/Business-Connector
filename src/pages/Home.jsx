import React from "react";
import { BarChart3, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatCard from "../components/StatCard";
import FeatureCard from "../components/FeatureCard";
import StepCard from "../components/StepCard";
import TestimonialCard from "../components/TestimonialCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <Navbar />

        <section className="grid items-center gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs uppercase tracking-wide text-emerald-200">
              Trusted Rural Commerce Network
            </span>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              Connect every stakeholder in agriculture with one verified platform.
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Business Connector unifies farmers, dealers, and government teams with live updates,
              secure onboarding, and transparent tracking for every crop cycle.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="/register" className="button-primary">
                Launch onboarding
              </a>
              <a href="#features" className="button-secondary">
                Explore features
              </a>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 card-shadow">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-400">Today’s live overview</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Active farmer clusters</span>
                  <span className="font-semibold text-emerald-200">126</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dealer procurement requests</span>
                  <span className="font-semibold text-emerald-200">84</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Govt. advisories queued</span>
                  <span className="font-semibold text-emerald-200">19</span>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <p className="font-semibold">SMS-first for low-connectivity regions</p>
                <p className="mt-1 text-emerald-100/80">
                  OTP onboarding works with any basic handset.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-14 md:grid-cols-3">
          <StatCard value="98%" label="OTP success rate" />
          <StatCard value="4.2x" label="Faster deal cycles" />
          <StatCard value="32k" label="Active producers" />
        </section>

        <section id="features" className="py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Features</p>
              <h2 className="mt-2 text-3xl font-semibold">All the tools for trust and execution.</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-300">
              Keep every stakeholder aligned with dashboards, verified identities, and instant
              communication.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Handshake size={20} />}
              title="Verified onboarding"
              description="OTP-backed onboarding ensures real farmer and dealer data."
            />
            <FeatureCard
              icon={<ShieldCheck size={20} />}
              title="Compliance controls"
              description="Role-based access keeps government advisories secure."
            />
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Live demand planning"
              description="Track crop availability and demand projections instantly."
            />
            <FeatureCard
              icon={<Sparkles size={20} />}
              title="Advisory automation"
              description="Send curated tips and scheme alerts via SMS."
            />
          </div>
        </section>

        <section id="solutions" className="py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Workflow</p>
              <h2 className="mt-2 text-3xl font-semibold">A guided journey for every user role.</h2>
              <p className="mt-3 text-sm text-slate-300">
                From registration to procurement, everyone sees their next best action in a unified
                workspace.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <StepCard
                  step="01"
                  title="Register with OTP"
                  description="Phone-based verification guarantees real-world identities."
                />
                <StepCard
                  step="02"
                  title="Share availability"
                  description="Farmers and dealers publish requirements in seconds."
                />
                <StepCard
                  step="03"
                  title="Coordinate logistics"
                  description="Stakeholders align on pickup schedules and pricing."
                />
                <StepCard
                  step="04"
                  title="Close the loop"
                  description="Government teams track compliance and impact."
                />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-xl font-semibold">Role-specific highlights</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Farmers get instant market pricing and advice.</li>
                <li>• Dealers forecast supply based on cluster data.</li>
                <li>• Government teams push verified scheme alerts.</li>
                <li>• Admins monitor audits and onboarding metrics.</li>
              </ul>
              <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                All workflows can be accessed via web or SMS.
              </div>
            </div>
          </div>
        </section>

        <section id="stories" className="py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Stories</p>
              <h2 className="mt-2 text-3xl font-semibold">Built with community insights.</h2>
            </div>
            <p className="text-sm text-slate-300">
              Real feedback from field coordinators and cooperatives.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <TestimonialCard
              name="Ravi Deshmukh"
              role="Farmer Collective Lead"
              quote="We now receive advisory SMS alerts before every pest cycle."
            />
            <TestimonialCard
              name="Sana Patel"
              role="Dealer Procurement"
              quote="Demand forecasting helps us schedule pickups without delays."
            />
            <TestimonialCard
              name="Meera Iyer"
              role="District Officer"
              quote="Compliance tracking is transparent and easy to export."
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/20 via-slate-900/70 to-slate-950 p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Ready to connect your network?</h2>
              <p className="mt-2 text-sm text-slate-300">
                Start onboarding in less than five minutes.
              </p>
            </div>
            <a href="/register" className="button-primary">
              Create an account
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
