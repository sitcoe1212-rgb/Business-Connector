import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between py-6">
      <Link to="/" className="text-lg font-semibold text-white">
        Business Connector
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/#features" className="text-slate-300 hover:text-white">
          Features
        </Link>
        <Link to="/#solutions" className="text-slate-300 hover:text-white">
          Solutions
        </Link>
        <Link to="/#stories" className="text-slate-300 hover:text-white">
          Stories
        </Link>
        {user ? (
          <>
            <Link to="/dashboard" className="button-secondary">
              Dashboard
            </Link>
            <button onClick={logout} className="button-secondary">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="button-secondary">
              Login
            </Link>
            <Link to="/register" className="button-primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
