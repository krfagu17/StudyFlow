"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to main dashboard
      router.refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative"
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(209,188,255,0.4)]">
          <span className="material-symbols-outlined text-on-primary text-2xl font-bold select-none">
            auto_stories
          </span>
        </div>
        <h1 className="font-bold text-2xl text-primary leading-none tracking-tight">StudyFlow</h1>
        <p className="text-xs text-on-surface-variant/80 tracking-widest uppercase mt-1">
          Premium Focus Platform
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-surface-container-lowest/80 rounded-xl p-1 border border-white/5 mb-6">
        <button
          onClick={() => {
            setIsLogin(true);
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            isLogin ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setIsLogin(false);
            setError("");
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            !isLogin ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-xl font-semibold text-center"
          >
            {error}
          </motion.div>
        )}

        {!isLogin && (
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant mb-1.5 block uppercase tracking-wider">
              FULL NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fagu Kumar"
              className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
            />
          </div>
        )}

        <div>
          <label className="text-[10px] font-bold text-on-surface-variant mb-1.5 block uppercase tracking-wider">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="fagu@studyflow.com"
            className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-on-surface-variant mb-1.5 block uppercase tracking-wider">
            PASSWORD
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface-container-lowest border border-white/10 rounded-xl p-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-primary/25 hover:brightness-105 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer mt-6 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isLogin ? "Authenticate Session" : "Create Account"}</span>
              <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform text-base select-none">
                login
              </span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
