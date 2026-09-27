import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Eye,
  EyeOff,
  Factory,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(
        email.trim(),
        password
      );

      // Keep the existing authentication flow unchanged.
      login(data.token, data.user);

      navigate("/admin");
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/20 blur-3xl" />

        <div
          className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] animate-pulse rounded-full bg-purple-600/20 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />

        <div
          className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl"
          style={{
            animation: "pulse 5s ease-in-out infinite",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.10),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.10),transparent_30%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left branding panel */}
        <div className="hidden flex-1 items-center justify-center px-12 lg:flex xl:px-20">
          <div className="w-full max-w-xl">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Factory size={25} />
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  Industrial IoT
                </p>

                <p className="text-xs font-medium tracking-wider text-slate-400">
                  INTELLIGENT OPERATIONS PLATFORM
                </p>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Sparkles size={14} />
                Smart Industrial Intelligence
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
                Monitor.
                <br />
                Predict.
                <br />
                <span className="text-blue-400">
                  Optimize.
                </span>
              </h1>

              <p className="max-w-lg text-base leading-7 text-slate-400">
                A centralized platform for industrial
                monitoring, predictive maintenance, machine
                intelligence, alerts, and cloud resource
                optimization.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3">
              <Feature
                icon={<Activity size={17} />}
                title="Live Monitoring"
              />

              <Feature
                icon={<BrainCircuit size={17} />}
                title="ML Predictions"
              />

              <Feature
                icon={<ShieldCheck size={17} />}
                title="Secure Access"
              />

              <Feature
                icon={<CheckCircle2 size={17} />}
                title="Smart Alerts"
              />
            </div>

            {/* Bottom status */}
            <div className="mt-12 flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Platform services operational
            </div>
          </div>
        </div>

        {/* Login panel */}
        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[520px] lg:bg-white">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Factory size={22} />
              </div>

              <div>
                <p className="font-bold text-white">
                  Industrial IoT
                </p>

                <p className="text-[10px] font-medium tracking-wider text-slate-400">
                  OPERATIONS PLATFORM
                </p>
              </div>
            </div>

            {/* Login card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl sm:p-9 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              {/* Header */}
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 lg:bg-blue-50">
                  <LockKeyhole size={23} />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-white lg:text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400 lg:text-slate-500">
                  Sign in to access your industrial operations
                  dashboard.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-300 lg:border-red-200 lg:bg-red-50 lg:text-red-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    !
                  </span>

                  <p className="leading-5">{error}</p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-200 lg:text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="group relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-500"
                    />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 lg:border-slate-200 lg:bg-white lg:text-slate-900 lg:placeholder:text-slate-400 lg:focus:border-blue-500 lg:focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-200 lg:text-slate-700"
                    >
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-500"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 lg:border-slate-200 lg:bg-white lg:text-slate-900 lg:placeholder:text-slate-400 lg:focus:border-blue-500 lg:focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-slate-300 lg:hover:bg-slate-100 lg:hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {/* Button shine */}
                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}

                  {loading ? (
                    <span className="relative flex items-center gap-3">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="relative flex items-center gap-2">
                      Sign in
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  )}
                </button>
              </form>

              {/* Security note */}
              <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} />
                Secure authenticated access
              </div>

              <p className="mt-6 text-center text-xs text-slate-600 lg:text-slate-400">
                Industrial IoT & Cloud Resource Optimization
                Platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 0.45;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.08);
            }
          }
        `}
      </style>
    </div>
  );
}

function Feature({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
        {icon}
      </div>

      <span className="text-sm font-medium text-slate-300">
        {title}
      </span>
    </div>
  );
}