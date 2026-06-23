import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Bus, CheckCircle2, LoaderCircle, LockKeyhole, Mail, MapPin, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { apiClient, api } from "../api";
import { useApi } from "../context/ApiContext";
import { navigate } from "../lib/navigation";

type AuthMode = "login" | "signup";

function AuthShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,83,68,0.24),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(17,92,137,0.18),_transparent_24%),linear-gradient(135deg,_#07111c_0%,_#0b1f1a_52%,_#081119_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_36%,rgba(0,83,68,0.14))]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-100">
                <Bus className="h-3.5 w-3.5" />
                ShuttleConnect
              </div>
              <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                Passenger auth that stays out of the way and into the trip.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: ShieldCheck,
                  title: "Tenant-safe access",
                  text: "Profiles are loaded through Supabase and checked against company-scoped backend rules.",
                },
                {
                  icon: MapPin,
                  title: "Route-aware journeys",
                  text: "The booking experience stays connected to the current route, fare, and seat availability.",
                },
                {
                  icon: Sparkles,
                  title: "Fast local navigation",
                  text: "Login, signup, and redirect flows use in-app routing so the pages render consistently.",
                },
                {
                  icon: CheckCircle2,
                  title: "Session persistence",
                  text: "Tokens are stored in localStorage and reused across page reloads.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#005344]/20 text-emerald-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-white">{title}</h2>
                      <p className="mt-1 text-xs leading-6 text-slate-300">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-lg rounded-[2rem] border border-slate-200/70 bg-white p-5 text-slate-900 shadow-2xl shadow-black/20 sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#005344]">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { setToken, isAuthenticated, isLoading } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/", true);
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await api.auth.signIn(email.trim(), password);
      const accessToken = response.data.session?.accessToken;

      if (!accessToken) {
        throw new Error("Sign-in succeeded, but no session token was returned.");
      }

      apiClient.setToken(accessToken);
      setToken(accessToken);
      setSuccess("Signed in successfully. Redirecting to your dashboard...");
      window.setTimeout(() => {
        window.location.assign("/");
      }, 650);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Customer access"
      title="Sign in to ShuttleConnect"
      description="Use your Supabase-backed customer account to search routes, book seats, and keep your trips tied to a valid backend session."
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Email</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 w-full border-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Password</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <LockKeyhole className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="h-12 w-full border-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#005344] text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Sign in
        </button>

        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-[#005344]/30 hover:text-[#005344]"
        >
          <UserPlus className="h-4 w-4" />
          Create an account
        </button>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const { setToken, isAuthenticated, isLoading } = useApi();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/", true);
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.signUp(email.trim(), password, fullName.trim());
      const accessToken = response.data.session?.accessToken;

      if (!accessToken) {
        setSuccess("Account created. Check your email to confirm the account, then sign in.");
        return;
      }

      apiClient.setToken(accessToken);
      setToken(accessToken);
      setSuccess("Account created successfully. Redirecting to your dashboard...");
      window.setTimeout(() => {
        window.location.assign("/");
      }, 650);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Customer onboarding"
      title="Create your account"
      description="Set up a passenger profile once, then use the same session to book routes, manage your tickets, and keep contact details in sync."
    >
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Full name</span>
          <input
            type="text"
            value={fullName}
            onChange={event => setFullName(event.target.value)}
            placeholder="Jane Wanjiku"
            autoComplete="name"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none placeholder:text-slate-400 focus:border-[#005344]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Email</span>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
            <Mail className="h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="h-12 w-full border-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Password</span>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none placeholder:text-slate-400 focus:border-[#005344]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={event => setConfirmPassword(event.target.value)}
            placeholder="Repeat the password"
            autoComplete="new-password"
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none placeholder:text-slate-400 focus:border-[#005344]"
          />
        </label>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !fullName || !email || !password || !confirmPassword}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#005344] text-sm font-black text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          Create account
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 transition hover:border-[#005344]/30 hover:text-[#005344]"
        >
          Already have an account?
        </button>
      </form>
    </AuthShell>
  );
}

export function AuthRoute({ mode }: { mode: AuthMode }) {
  return mode === "signup" ? <SignupPage /> : <LoginPage />;
}
