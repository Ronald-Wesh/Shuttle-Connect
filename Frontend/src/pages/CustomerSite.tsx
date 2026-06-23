import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  MapPin,
  Moon,
  Phone,
  Search,
  ShieldCheck,
  Sun,
  Ticket,
  Timer,
  UsersRound,
  X
} from "lucide-react";
import { INITIAL_DEPARTURES, INITIAL_OPERATORS } from "../data";
import { useApi } from "../context/ApiContext";
import { navigate } from "../lib/navigation";
import type { Departure } from "../types";

type Step = "search" | "track" | "seats" | "pass";

const blockedSeats = [6, 14];

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatSeat(seat: number) {
  return String(seat).padStart(2, "0");
}

function seatsLeftForTrip(trip: Departure) {
  const blockedForTrip = blockedSeats.filter(seat => seat <= trip.capacity).length;
  return Math.max(0, trip.capacity - trip.occupiedSeats.length - blockedForTrip);
}

function QRPattern() {
  const cells = [
    1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1,
    1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0,
    1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1,
    1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0,
    0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1,
    1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1,
    0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0,
    1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1,
    1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1,
    0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1
  ];

  return (
    <div className="grid h-44 w-44 grid-cols-12 gap-1 rounded-xl bg-white p-3 shadow-inner">
      {cells.map((filled, index) => (
        <span key={index} className={`rounded-[2px] ${filled ? "bg-slate-950" : "bg-white"}`} />
      ))}
    </div>
  );
}

function MpesaModal({
  phone,
  setPhone,
  amount,
  onClose,
  onSuccess
}: {
  phone: string;
  setPhone: (phone: string) => void;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [waiting, setWaiting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setInterval(() => {
      setSecondsLeft(previous => {
        if (previous <= 1) {
          window.clearInterval(timer);
          onSuccess();
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [waiting, onSuccess]);

  const progress = ((60 - secondsLeft) / 60) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
      <section className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#005344]">M-Pesa checkout</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-950">Confirm payment</h2>
            <p className="mt-1 text-sm text-slate-500">Enter the Safaricom number that should receive the PIN prompt.</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase text-emerald-800">Amount due</p>
          <p className="mt-1 text-3xl font-black text-[#005344]">KES {amount.toLocaleString()}</p>
        </div>

        <label className="mt-5 block text-xs font-extrabold uppercase tracking-widest text-slate-500">Phone number</label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">+254</span>
          <input
            value={phone}
            onChange={event => setPhone(event.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="738836122"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-16 pr-4 font-mono text-sm font-bold outline-none focus:border-[#005344] focus:bg-white"
          />
        </div>

        <button
          disabled={phone.length !== 9 || waiting}
          onClick={() => setWaiting(true)}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005344] text-sm font-extrabold text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          <CreditCard className="h-4 w-4" />
          Send M-Pesa prompt
        </button>

        {waiting && (
          <div className="absolute inset-0 flex flex-col justify-end rounded-t-3xl bg-white/95 p-5 backdrop-blur sm:rounded-2xl">
            <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#005344] text-white">
                <Phone className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-slate-950">Waiting for M-Pesa PIN prompt...</h3>
              <p className="mt-2 text-sm text-slate-500">Check +254 {phone} and enter your M-Pesa PIN to complete booking.</p>
              <p className="mt-4 font-mono text-3xl font-black text-[#005344]">{secondsLeft}s</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-[#005344] transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button onClick={onSuccess} className="h-11 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600">
              Complete demo payment
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default function CustomerSite() {
  const { user, isAuthenticated, logout } = useApi();
  const [step, setStep] = useState<Step>("search");
  const [source, setSource] = useState("All");
  const [destination, setDestination] = useState("All");
  const [operatorFilter, setOperatorFilter] = useState("All");
  const [travelDate, setTravelDate] = useState("2026-06-01");
  const [selectedTrip, setSelectedTrip] = useState<Departure | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("tl_theme") === "dark");

  const trips = useMemo(() => {
    return INITIAL_DEPARTURES
      .filter(trip => trip.status !== "DEPARTED")
      .filter(trip => operatorFilter === "All" || trip.operatorId === operatorFilter)
      .filter(trip => source === "All" || trip.from === source)
      .filter(trip => destination === "All" || trip.to === destination)
      .filter(trip => trip.date === travelDate)
      .sort((a, b) => a.departTime.localeCompare(b.departTime));
  }, [source, destination, operatorFilter, travelDate]);

  const allPublishedTrips = useMemo(() => {
    return INITIAL_DEPARTURES
      .filter(trip => trip.status !== "DEPARTED")
      .sort((a, b) => `${a.date} ${a.departTime}`.localeCompare(`${b.date} ${b.departTime}`));
  }, []);

  const trackedTrips = useMemo(() => {
    return allPublishedTrips
      .filter(trip => operatorFilter === "All" || trip.operatorId === operatorFilter)
      .filter(trip => source === "All" || trip.from === source)
      .filter(trip => destination === "All" || trip.to === destination);
  }, [allPublishedTrips, operatorFilter, source, destination]);

  const selectedOperator = selectedTrip ? INITIAL_OPERATORS.find(operator => operator.id === selectedTrip.operatorId) : null;
  const amount = selectedTrip ? selectedSeats.length * selectedTrip.fare : 0;
  const activeBlockedSeats = selectedTrip ? blockedSeats.filter(seat => seat <= selectedTrip.capacity) : [];
  const bookedSeats = selectedTrip ? [...selectedTrip.occupiedSeats, ...activeBlockedSeats] : [];
  const totalSeatsLeft = trips.reduce((sum, trip) => sum + seatsLeftForTrip(trip), 0);
  const operatorRouteCounts = INITIAL_OPERATORS.map(operator => ({
    operator,
    trips: allPublishedTrips.filter(trip => trip.operatorId === operator.id),
    seatsLeft: allPublishedTrips.filter(trip => trip.operatorId === operator.id).reduce((sum, trip) => sum + seatsLeftForTrip(trip), 0)
  }));

  useEffect(() => {
    localStorage.setItem("tl_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const chooseTrip = (trip: Departure) => {
    setSelectedTrip(trip);
    setSelectedSeats([]);
    setStep("seats");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (targetStep: Step) => {
    if (targetStep === "seats" && !selectedTrip && trips[0]) {
      setSelectedTrip(trips[0]);
      setSelectedSeats([]);
    }
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSeat = (seat: number) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(previous => previous.includes(seat) ? previous.filter(item => item !== seat) : [...previous, seat]);
  };

  const completePayment = () => {
    setTicketCode(`NR-${Date.now().toString().slice(-6)}`);
    setCheckoutOpen(false);
    setStep("pass");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const downloadTicket = () => {
    if (!selectedTrip || !ticketCode) return;
    const ticket = [
      "NORTH RIFT SHUTTLE BOARDING PASS",
      `Ticket: ${ticketCode}`,
      `Route: ${selectedTrip.from} to ${selectedTrip.to}`,
      `Date: ${formatDate(selectedTrip.date)}`,
      `Departure: ${selectedTrip.departTime}`,
      `Vehicle: ${selectedTrip.vehiclePlate}`,
      `Seats: ${selectedSeats.map(formatSeat).join(", ")}`,
      `Phone: +254 ${phone}`,
      `Amount: KES ${amount.toLocaleString()}`
    ].join("\n");
    const blob = new Blob([ticket], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticketCode}-boarding-pass.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${darkMode ? "theme-dark bg-slate-950 text-slate-100" : "bg-[#f4f7f6] text-slate-950"} flex h-screen overflow-hidden font-sans`}>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 p-5">
          <button onClick={() => setStep("search")} className="flex items-center gap-3 text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#005344] text-white">
              <Bus className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-black leading-tight text-[#005344]">TransitLink</h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">All Shuttle Routes</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-3">
          {[
            { id: "search", label: "All Shuttle Routes", icon: Search },
            { id: "track", label: "Track Posted Trips", icon: Activity },
            { id: "seats", label: "Seat Selection", icon: UsersRound },
            { id: "pass", label: "Boarding Pass", icon: Ticket }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                onClick={() => goToStep(item.id as Step)}
                className={`flex h-14 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-black transition ${
                  step === item.id
                    ? "bg-[#005344] text-white shadow-sm"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-[#005344]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4 space-y-2">
          <button
            onClick={() => navigate("/login")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#005344]/20 bg-[#005344] text-xs font-black text-white"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-600"
          >
            Create account
          </button>
          <button onClick={() => navigate("/admin")} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-slate-600">
            <ShieldCheck className="h-4 w-4 text-[#005344]" />
            Admin Console
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-16 flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <button onClick={() => setStep("search")} className="flex items-center gap-3 text-left md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005344] text-white">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-black leading-tight text-[#005344]">North Rift Shuttle</h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Mobile booking</p>
            </div>
          </button>
          <div className="hidden md:block">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#005344]">
              {step === "search" ? "Trip Search" : step === "seats" ? "Seat Selection" : "Boarding Pass"}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">TransitLink Shuttle Marketplace</h2>
            <p className="mt-1 text-sm text-slate-500">Browse, compare, track, and book every shuttle route posted on the transit site.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAuthenticated && (
              <span className="inline-flex items-center gap-2 rounded-xl border border-[#005344]/20 bg-[#005344]/10 px-3 py-2 text-xs font-extrabold text-[#005344]">
                Signed in as {user?.name || user?.email || "customer"}
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800">
              <ShieldCheck className="h-4 w-4" />
              M-Pesa secure
            </span>
            {isAuthenticated && (
              <button onClick={logout} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
                Logout
              </button>
            )}
            <button onClick={() => navigate("/login")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
              Sign in
            </button>
            <button onClick={() => navigate("/signup")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
              Sign up
            </button>
            <button onClick={() => navigate("/admin")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
              Admin Console
            </button>
            <button onClick={() => setDarkMode(value => !value)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-600 shadow-sm">
              {darkMode ? <Sun className="h-4 w-4 text-[#005344]" /> : <Moon className="h-4 w-4 text-[#005344]" />}
              Theme
            </button>
          </div>
        </div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:py-8 md:px-6">
        <div className="mx-auto max-w-5xl">
        {step !== "search" && (
          <button onClick={() => setStep(step === "pass" ? "seats" : "search")} className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        {step === "search" && (
          <div className="space-y-5">
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Available Trips</p>
                <p className="mt-2 text-2xl font-black">{allPublishedTrips.length}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">Across all posted shuttles</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Seats Left</p>
                <p className="mt-2 text-2xl font-black">{allPublishedTrips.reduce((sum, trip) => sum + seatsLeftForTrip(trip), 0)}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">Available across network</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Lowest Fare</p>
                <p className="mt-2 text-2xl font-black">KES {trips.length ? Math.min(...trips.map(trip => trip.fare)).toLocaleString() : "0"}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">Pay securely via M-Pesa</p>
              </article>
              <article className="rounded-lg border border-[#005344] bg-[#005344] p-4 text-white shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-100">Active Shuttles</p>
                <p className="mt-2 text-2xl font-black">{INITIAL_OPERATORS.length}</p>
                <p className="mt-3 text-xs font-bold text-emerald-100">Mololine, North Rift, Sharks</p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {operatorRouteCounts.map(({ operator, trips: operatorTrips, seatsLeft }) => (
                <button
                  key={operator.id}
                  onClick={() => {
                    setOperatorFilter(operator.id);
                    setStep("track");
                  }}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#005344]"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${operator.bgGradient} text-white`}>
                    <Bus className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-black text-slate-950">{operator.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{operatorTrips.length} posted trips, {seatsLeft} seats left</p>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-[#005344]">View shuttle routes</p>
                </button>
              ))}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <label className="block">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Shuttle</span>
                    <select value={operatorFilter} onChange={event => setOperatorFilter(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#005344]">
                      <option>All</option>
                      {INITIAL_OPERATORS.map(operator => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Source</span>
                    <select value={source} onChange={event => setSource(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#005344]">
                      <option>All</option>
                      <option>Nairobi</option>
                      <option>Nakuru</option>
                      <option>Eldoret</option>
                      <option>Kisumu</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Destination</span>
                    <select value={destination} onChange={event => setDestination(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#005344]">
                      <option>All</option>
                      <option>Eldoret</option>
                      <option>Kitale</option>
                      <option>Kisumu</option>
                      <option>Nakuru</option>
                      <option>Nairobi</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Travel Date</span>
                    <input type="date" value={travelDate} onChange={event => setTravelDate(event.target.value)} className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-[#005344]" />
                  </label>
                  <button className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#005344] px-5 text-sm font-black text-white lg:mt-5">
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                </div>
              </div>
              <div className="flex items-end justify-between gap-3 border-b border-slate-100 p-4">
                <div>
                  <h2 className="text-lg font-black">Available Trips Today</h2>
                  <p className="text-xs font-semibold text-slate-500">{trips.length} departures across {operatorFilter === "All" ? "all shuttles" : INITIAL_OPERATORS.find(operator => operator.id === operatorFilter)?.name}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase text-slate-500 shadow-sm">{formatDate(travelDate)}</span>
              </div>

              <div className="grid max-h-[48vh] grid-cols-1 gap-3 overflow-y-auto p-4 lg:grid-cols-2">
                {trips.map(trip => {
                  const seatsLeft = seatsLeftForTrip(trip);
                  const operator = INITIAL_OPERATORS.find(item => item.id === trip.operatorId);

                  return (
                    <article key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#005344]">{operator?.name}</p>
                          <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-black">
                            {trip.from}
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            {trip.to}
                          </h3>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${seatsLeft <= 3 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
                          {seatsLeft} Seats Left
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <Clock className="mb-1 h-4 w-4 text-[#005344]" />
                          <p className="font-extrabold text-slate-400">Time</p>
                          <p className="font-black">{trip.departTime}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <Ticket className="mb-1 h-4 w-4 text-[#005344]" />
                          <p className="font-extrabold text-slate-400">Fare</p>
                          <p className="font-black">KES {trip.fare.toLocaleString()}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <Bus className="mb-1 h-4 w-4 text-[#005344]" />
                          <p className="font-extrabold text-slate-400">Plate</p>
                          <p className="font-black">{trip.vehiclePlate}</p>
                        </div>
                      </div>

                      <button onClick={() => chooseTrip(trip)} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005344] text-sm font-black text-white">
                        Select trip
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </article>
                  );
                })}
              </div>
              {trips.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <Bus className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-3 font-black text-slate-950">No trips found for this search</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Reset filters to show every published shuttle route on June 1, 2026.</p>
                  <button
                    onClick={() => {
                      setOperatorFilter("All");
                      setSource("All");
                      setDestination("All");
                      setTravelDate("2026-06-01");
                    }}
                    className="mt-4 h-11 rounded-xl bg-[#005344] px-4 text-xs font-black text-white"
                  >
                    Load Demo Trips
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {step === "track" && (
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#005344]">Live Posted Trips</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Track every shuttle on TransitLink</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Follow published routes, capacity, operator, vehicle plate, and departure state.</p>
                </div>
                <button
                  onClick={() => {
                    setOperatorFilter("All");
                    setSource("All");
                    setDestination("All");
                  }}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600"
                >
                  Show All Shuttles
                </button>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {operatorRouteCounts.map(({ operator, trips: operatorTrips, seatsLeft }) => (
                <article key={operator.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{operator.name}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">{operatorTrips.length}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">posted trips, {seatsLeft} seats left</p>
                </article>
              ))}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select value={operatorFilter} onChange={event => setOperatorFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold">
                    <option>All</option>
                    {INITIAL_OPERATORS.map(operator => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
                  </select>
                  <select value={source} onChange={event => setSource(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold">
                    <option>All</option>
                    <option>Nairobi</option>
                    <option>Nakuru</option>
                    <option>Eldoret</option>
                    <option>Kisumu</option>
                  </select>
                  <select value={destination} onChange={event => setDestination(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold">
                    <option>All</option>
                    <option>Eldoret</option>
                    <option>Kitale</option>
                    <option>Kisumu</option>
                    <option>Nakuru</option>
                    <option>Nairobi</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[58vh] overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {trackedTrips.map(trip => {
                    const operator = INITIAL_OPERATORS.find(item => item.id === trip.operatorId);
                    const seatsLeft = seatsLeftForTrip(trip);
                    const capacityPercent = Math.round((trip.occupiedSeats.length / trip.capacity) * 100);

                    return (
                      <article key={trip.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#005344]">{operator?.name}</p>
                            <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-black text-slate-950">
                              {trip.from}
                              <ArrowRight className="h-4 w-4 text-slate-400" />
                              {trip.to}
                            </h3>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${trip.status === "LIVE" ? "bg-emerald-50 text-emerald-700" : trip.status === "BOARDING" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700"}`}>
                            {trip.status}
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                          <div className="rounded-lg bg-slate-50 p-3">
                            <Timer className="mb-1 h-4 w-4 text-[#005344]" />
                            <p className="font-black text-slate-400">Time</p>
                            <p className="font-black">{trip.departTime}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <Bus className="mb-1 h-4 w-4 text-[#005344]" />
                            <p className="font-black text-slate-400">Plate</p>
                            <p className="font-black">{trip.vehiclePlate}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <Ticket className="mb-1 h-4 w-4 text-[#005344]" />
                            <p className="font-black text-slate-400">Fare</p>
                            <p className="font-black">KES {trip.fare.toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3">
                            <UsersRound className="mb-1 h-4 w-4 text-[#005344]" />
                            <p className="font-black text-slate-400">Seats</p>
                            <p className="font-black">{seatsLeft} left</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-[10px] font-black uppercase text-slate-400">
                            <span>Capacity filled</span>
                            <span>{capacityPercent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-[#005344]" style={{ width: `${capacityPercent}%` }} />
                          </div>
                        </div>
                        <button onClick={() => chooseTrip(trip)} className="mt-4 h-11 w-full rounded-xl bg-[#005344] text-xs font-black text-white">
                          Book This Shuttle
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {step === "seats" && selectedTrip && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#005344]">Seat selector</p>
                  <h2 className="mt-1 text-2xl font-black">{selectedTrip.from} to {selectedTrip.to}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{selectedOperator?.name} - {selectedTrip.departTime}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{selectedTrip.capacity} seats</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-slate-300 bg-white" /> Available</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#005344]" /> Selected</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-300" /> Booked</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-100" /> Blocked</span>
              </div>

              <div className="mt-5 rounded-[28px] border-2 border-slate-200 bg-slate-50 p-5">
                <div className="mb-5 flex items-center justify-between border-b border-dashed border-slate-300 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Front</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-slate-400 text-[10px] font-black text-slate-400">DRV</span>
                </div>
                <div className="mx-auto grid max-w-sm grid-cols-[1fr_1fr_24px_1fr_1fr] gap-3">
                  {Array.from({ length: selectedTrip.capacity }, (_, index) => index + 1).map(seat => {
                    const booked = selectedTrip.occupiedSeats.includes(seat);
                    const blocked = activeBlockedSeats.includes(seat);
                    const selected = selectedSeats.includes(seat);
                    return (
                      <button
                        key={seat}
                        disabled={booked || blocked}
                        onClick={() => toggleSeat(seat)}
                        className={`aspect-square min-h-12 rounded-xl border text-sm font-black transition ${(seat - 1) % 4 === 2 ? "col-start-4" : ""} ${
                          booked
                            ? "border-slate-300 bg-slate-300 text-slate-500"
                            : blocked
                            ? "border-red-200 bg-red-100 text-red-700"
                            : selected
                            ? "border-[#005344] bg-[#005344] text-white shadow-md"
                            : "border-slate-200 bg-white text-[#005344]"
                        }`}
                      >
                        {formatSeat(seat)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:self-start">
              <h3 className="text-lg font-black">Trip summary</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center gap-2 font-bold text-slate-600"><MapPin className="h-4 w-4 text-[#005344]" /> {selectedTrip.from} to {selectedTrip.to}</p>
                <p className="flex items-center gap-2 font-bold text-slate-600"><CalendarDays className="h-4 w-4 text-[#005344]" /> {formatDate(selectedTrip.date)} at {selectedTrip.departTime}</p>
                <p className="flex items-center gap-2 font-bold text-slate-600"><UsersRound className="h-4 w-4 text-[#005344]" /> Seats {selectedSeats.length ? selectedSeats.map(formatSeat).join(", ") : "not selected"}</p>
              </div>
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-black uppercase text-emerald-800">Total</p>
                <p className="mt-1 text-3xl font-black text-[#005344]">KES {amount.toLocaleString()}</p>
              </div>
              <button
                disabled={selectedSeats.length === 0}
                onClick={() => setCheckoutOpen(true)}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005344] text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-400"
              >
                Continue to M-Pesa
                <CreditCard className="h-4 w-4" />
              </button>
            </aside>
          </div>
        )}

        {step === "seats" && !selectedTrip && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Bus className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-3 text-xl font-black text-slate-950">No trip available for seat selection</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Adjust your search filters, then select a trip to view its seat map.</p>
            <button onClick={() => goToStep("search")} className="mt-5 h-11 rounded-xl bg-[#005344] px-5 text-xs font-black text-white">
              Find Trips
            </button>
          </section>
        )}

        {step === "pass" && selectedTrip && ticketCode && (
          <section className="mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-[#005344] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-100">Digital boarding pass</p>
                  <h2 className="mt-2 text-2xl font-black">Payment confirmed</h2>
                </div>
                <CheckCircle2 className="h-9 w-9 text-emerald-200" />
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-center rounded-2xl bg-slate-50 p-5">
                <QRPattern />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Route</p>
                  <p className="mt-1 font-black">{selectedTrip.from} to {selectedTrip.to}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Vehicle</p>
                  <p className="mt-1 font-mono font-black">{selectedTrip.vehiclePlate}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Seat</p>
                  <p className="mt-1 font-mono text-xl font-black text-[#005344]">{selectedSeats.map(formatSeat).join(", ")}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase text-slate-400">Ticket</p>
                  <p className="mt-1 font-mono font-black">{ticketCode}</p>
                </div>
              </div>
              <button onClick={downloadTicket} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#005344] text-sm font-black text-white">
                <Download className="h-4 w-4" />
                Download Ticket
              </button>
              <button onClick={() => setStep("search")} className="mt-3 h-11 w-full rounded-xl border border-slate-200 text-xs font-black text-slate-600">
                Book another trip
              </button>
            </div>
          </section>
        )}

        {step === "pass" && (!selectedTrip || !ticketCode) && (
          <section className="mx-auto max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <Ticket className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No boarding pass yet</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">Complete M-Pesa checkout to generate your digital ticket and QR pass.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button onClick={() => goToStep("search")} className="h-11 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-600">
                Browse Trips
              </button>
              <button onClick={() => goToStep("seats")} className="h-11 rounded-xl bg-[#005344] text-xs font-black text-white">
                Select Seats
              </button>
            </div>
          </section>
        )}
        </div>
      </section>
      </main>

      {checkoutOpen && (
        <MpesaModal
          phone={phone}
          setPhone={setPhone}
          amount={amount}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={completePayment}
        />
      )}
    </div>
  );
}
