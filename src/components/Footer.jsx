import React from "react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 pt-10 text-sm text-slate-400">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-base font-semibold text-white">Business Connector</p>
          <p className="mt-3">
            Helping farmers, dealers, and public agencies collaborate with clarity and trust.
          </p>
        </div>
        <div>
          <p className="text-base font-semibold text-white">Resources</p>
          <ul className="mt-3 space-y-2">
            <li>Partner onboarding</li>
            <li>Compliance toolkit</li>
            <li>Local weather network</li>
          </ul>
        </div>
        <div>
          <p className="text-base font-semibold text-white">Support</p>
          <ul className="mt-3 space-y-2">
            <li>WhatsApp helpdesk</li>
            <li>SMS alerts &amp; guidance</li>
            <li>Government scheme updates</li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-xs text-slate-500">
        © 2024 Business Connector. Built for community-driven agriculture.
      </p>
    </footer>
  );
}
