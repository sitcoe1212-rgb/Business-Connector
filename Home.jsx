import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-effect w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">FarmConnect</h1>
        <p className="text-gray-600 mb-6">Farmer & Dealer portal with SMS OTP verification.</p>

        <div className="space-y-3">
          <Link className="btn-gradient" to="/login">Login</Link>
          <Link className="btn-gradient" to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
