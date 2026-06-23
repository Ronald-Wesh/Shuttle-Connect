import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  Bus,
  CarFront,
  CheckCircle2,
  Clock,
  CreditCard,
  Gauge,
  Chrome,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  X
} from "lucide-react";
import { INITIAL_DEPARTURES, INITIAL_OPERATORS } from "../data";
import type { Departure, DepartureStatus, OperatorId } from "../types";
import NewDepartureModal from "../components/NewDepartureModal";

type PageId = "dashboard" | "route-seating" | "settlements" | "analytics" | "registry" | "settings";
type StatusFilter = "ALL" | "LIVE" | "BOARDING" | "SCHEDULED";
type SeatState = "available" | "selected" | "blocked" | "booked";
type RegistryTab = "fleet" | "drivers";
type RoleName = "Admin" | "Dispatcher" | "Accountant";
type AdminAccount = {
  name: string;
  username: string;
  password: string;
  operatorId: OperatorId;
};

const adminAccounts: AdminAccount[] = [
  { name: "North Rift Admin", username: "northrift", password: "admin123", operatorId: "north-rift" },
  { name: "Mololine Admin", username: "mololine", password: "admin123", operatorId: "mololine" },
  { name: "Sharks Premium Admin", username: "sharks", password: "admin123", operatorId: "sharks" }
];

const pages: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Main Dashboard", icon: LayoutDashboard },
  { id: "route-seating", label: "Route & Seating", icon: Route },
  { id: "settlements", label: "M-Pesa Settlements", icon: WalletCards },
  { id: "analytics", label: "Corridor Stats", icon: BarChart3 },
  { id: "registry", label: "Vehicle & Driver Registry", icon: CarFront },
  { id: "settings", label: "Developer Settings", icon: Settings }
];

const statusStyles: Record<DepartureStatus, string> = {
  LIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  BOARDING: "border-amber-200 bg-amber-50 text-amber-800",
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-800",
  DEPARTED: "border-slate-200 bg-slate-100 text-slate-500"
};

const routeRows = [
  { from: "Nairobi", to: "Eldoret", baseFare: 1400, peakFare: 1600, vehicle: "KCQ 482A", driver: "Jackson Kiprop", times: "07:00, 13:00, 18:30" },
  { from: "Nairobi", to: "Kitale", baseFare: 1600, peakFare: 1800, vehicle: "KDM 921B", driver: "Daniel Chemetian", times: "09:00, 15:30" },
  { from: "Nairobi", to: "Kisumu", baseFare: 1600, peakFare: 1900, vehicle: "KDM 843X", driver: "Timothy Rotich", times: "08:00, 12:45, 20:00" }
];

const transactions = [
  { code: "QE78UX99L", timestamp: "2026-05-30 10:41", phone: "0722 114 233", amount: 3200, route: "Nairobi to Kisumu", status: "Success" },
  { code: "QE51LB74P", timestamp: "2026-05-30 10:18", phone: "0738 836 122", amount: 1400, route: "Nairobi to Eldoret", status: "Success" },
  { code: "QE19KT44X", timestamp: "2026-05-30 09:57", phone: "0700 998 877", amount: 1600, route: "Nairobi to Kitale", status: "Flagged" },
  { code: "QE93MN20Q", timestamp: "2026-05-30 09:23", phone: "0711 445 566", amount: 2800, route: "Nairobi to Eldoret", status: "Success" },
  { code: "QE44UZ88R", timestamp: "2026-05-30 08:52", phone: "0799 111 422", amount: 1600, route: "Nairobi to Kisumu", status: "Failed" },
  { code: "QE27FA10N", timestamp: "2026-05-30 08:11", phone: "0744 902 617", amount: 1800, route: "Nairobi to Kitale", status: "Success" }
];

const fleet = [
  { model: "Toyota HiAce Super GL", plate: "KCQ 482A", capacity: 14, alert: "NTSA due in 12 days", severity: "amber" },
  { model: "Nissan Caravan", plate: "KDM 921B", capacity: 11, alert: "Insurance due in 28 days", severity: "green" },
  { model: "Toyota HiAce Commuter", plate: "KDK 555K", capacity: 14, alert: "Inspection due in 5 days", severity: "red" },
  { model: "Mercedes Sprinter", plate: "KDM 843X", capacity: 14, alert: "Insurance due in 41 days", severity: "green" }
];

const drivers = [
  { name: "Jackson Kiprop", phone: "0722 410 822", license: "Valid until Nov 2026", state: "On-Trip" },
  { name: "Daniel Chemetian", phone: "0718 212 044", license: "Valid until Aug 2026", state: "Resting" },
  { name: "Ezekiel Kuria", phone: "0735 668 910", license: "Renewal in 18 days", state: "Off-Duty" },
  { name: "Timothy Rotich", phone: "0790 145 222", license: "Valid until Jan 2027", state: "On-Trip" }
];

const roleDefaults: Record<RoleName, Record<PageId, boolean>> = {
  Admin: { dashboard: true, "route-seating": true, settlements: true, analytics: true, registry: true, settings: true },
  Dispatcher: { dashboard: true, "route-seating": true, settlements: false, analytics: true, registry: true, settings: false },
  Accountant: { dashboard: true, "route-seating": false, settlements: true, analytics: true, registry: false, settings: false }
};

function formatKes(value: number) {
  return `KES ${value.toLocaleString()}`;
}

function ShellButton({ page, active, onClick }: { key?: string; page: (typeof pages)[number]; active: boolean; onClick: () => void }) {
  const Icon = page.icon;

  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-xs font-bold transition ${
        active ? "bg-[#005344] text-white shadow-sm" : "text-slate-500 hover:bg-emerald-50 hover:text-[#005344]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 truncate">{page.label}</span>
    </button>
  );
}

function MetricCard({ label, value, detail, icon: Icon, strong }: { label: string; value: string; detail: string; icon: typeof Bus; strong?: boolean }) {
  return (
    <article className={`rounded-lg border p-4 shadow-sm ${strong ? "border-[#005344] bg-[#005344] text-white" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-extrabold uppercase tracking-widest ${strong ? "text-emerald-100" : "text-slate-400"}`}>{label}</p>
          <p className={`mt-2 text-2xl font-extrabold ${strong ? "text-white" : "text-slate-950"}`}>{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${strong ? "bg-white/15" : "bg-emerald-50 text-[#005344]"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${strong ? "text-emerald-100" : "text-slate-500"}`}>{detail}</p>
    </article>
  );
}

function DepartureCard({ departure }: { key?: string; departure: Departure }) {
  const seatsFilled = departure.occupiedSeats.length;
  const percent = Math.round((seatsFilled / departure.capacity) * 100);
  const operator = INITIAL_OPERATORS.find(item => item.id === departure.operatorId);

  return (
    <article className="flex min-h-[296px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Clock className="h-4 w-4 text-[#005344]" />
            {departure.departTime}
          </p>
          <h3 className="mt-3 flex flex-wrap items-center gap-2 text-lg font-extrabold text-slate-950">
            {departure.from}
            <ArrowRight className="h-4 w-4 text-slate-400" />
            {departure.to}
          </h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusStyles[departure.status]}`}>
          {departure.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="font-bold uppercase text-slate-400">Carrier</dt>
          <dd className="text-right font-extrabold text-[#005344]">{operator?.name ?? "North Rift Shuttle"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-bold uppercase text-slate-400">Plate</dt>
          <dd className="text-right font-mono font-bold text-slate-900">{departure.vehiclePlate}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-bold uppercase text-slate-400">Driver</dt>
          <dd className="text-right font-bold text-slate-900">{departure.driverName}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Seat Capacity</p>
            <p className="text-base font-extrabold text-slate-950">{seatsFilled} / {departure.capacity} Seats Filled</p>
          </div>
          <span className="font-mono text-sm font-extrabold text-[#005344]">{percent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${percent > 90 ? "bg-red-500" : "bg-[#005344]"}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </article>
  );
}

function MainDashboard({ departures }: { departures: Departure[] }) {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const visibleDepartures = departures.filter(departure => {
    const routeText = `${departure.from} ${departure.to} ${departure.vehiclePlate} ${departure.driverName}`.toLowerCase();
    return (filter === "ALL" || departure.status === filter) && routeText.includes(search.toLowerCase());
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="KES Daily Revenue" value={formatKes(82400)} detail="+8% versus yesterday" icon={TrendingUp} />
        <MetricCard label="Total Passengers" value="29" detail="Across active North Rift manifests" icon={UsersRound} />
        <MetricCard label="Fleet Deployment" value="4 Vehicles" detail="Scheduled for today's corridors" icon={Bus} />
        <MetricCard label="Capacity Utilization" value="42%" detail="52 seats tracked in live inventory" icon={Gauge} strong />
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-extrabold text-slate-950">Departures Today</h2>
              <p className="text-xs text-slate-500">Dense operational cards with full route, vehicle, driver, and capacity details.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search route, plate, driver"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-[#005344] focus:bg-white"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["ALL", "LIVE", "BOARDING", "SCHEDULED"] as StatusFilter[]).map(item => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`h-10 rounded-lg border px-3 text-xs font-extrabold ${filter === item ? "border-[#005344] bg-[#005344] text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    {item === "ALL" ? "All" : item[0] + item.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {visibleDepartures.map(departure => <DepartureCard key={departure.id} departure={departure} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function SeatButton({ seat, state, onClick }: { seat: number; state: SeatState; onClick: () => void }) {
  const classes: Record<SeatState, string> = {
    available: "border-slate-200 bg-white text-[#005344] hover:border-[#005344]",
    selected: "border-[#005344] bg-[#005344] text-white",
    blocked: "border-red-200 bg-red-50 text-red-700",
    booked: "border-slate-300 bg-slate-200 text-slate-500"
  };

  return (
    <button onClick={onClick} className={`flex aspect-square min-h-12 items-center justify-center rounded-lg border text-sm font-extrabold ${classes[state]}`}>
      {String(seat).padStart(2, "0")}
    </button>
  );
}

function RouteSeatingManager() {
  const [capacity, setCapacity] = useState<11 | 14>(14);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([4, 9]);
  const booked = capacity === 14 ? [1, 2, 3, 7, 8, 12] : [1, 5, 9];
  const blocked = capacity === 14 ? [14] : [11];

  const seatState = (seat: number): SeatState => {
    if (booked.includes(seat)) return "booked";
    if (blocked.includes(seat)) return "blocked";
    if (selectedSeats.includes(seat)) return "selected";
    return "available";
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(420px,0.95fr)_1.25fr]">
      <section className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Interactive Bus Seating</h2>
            <p className="mt-1 text-xs text-slate-500">Switch between live 11-seater and 14-seater shuttle maps.</p>
          </div>
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            {[11, 14].map(size => (
              <button key={size} onClick={() => setCapacity(size as 11 | 14)} className={`h-9 rounded-md px-3 text-xs font-extrabold ${capacity === size ? "bg-[#005344] text-white" : "text-slate-600"}`}>
                {size} Seats
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[11px] font-bold text-slate-500">
          {[
            ["bg-white border-slate-300", "Available"],
            ["bg-[#005344] border-[#005344]", "Selected"],
            ["bg-red-50 border-red-200", "Blocked"],
            ["bg-slate-200 border-slate-300", "Booked"]
          ].map(([swatch, label]) => (
            <span key={label} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded border ${swatch}`} />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-5 rounded-[28px] border-2 border-slate-200 bg-slate-50 p-5">
          <div className="mb-5 flex items-center justify-between border-b border-dashed border-slate-300 pb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Front Cabin</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-slate-400 text-xs font-black text-slate-400">DRV</span>
          </div>
          <div className="mx-auto grid max-w-sm grid-cols-[1fr_1fr_24px_1fr_1fr] gap-3">
            {Array.from({ length: capacity }, (_, index) => index + 1).map(seat => (
              <div key={seat} className={(seat - 1) % 4 === 2 ? "col-start-4" : ""}>
                <SeatButton
                  seat={seat}
                  state={seatState(seat)}
                  onClick={() => {
                    if (booked.includes(seat)) return;
                    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(item => item !== seat) : [...prev, seat]);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-950">Route, Pricing & Scheduling</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" defaultValue="Nairobi" aria-label="From" />
          <input className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" defaultValue="Eldoret" aria-label="To" />
          <input className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" defaultValue="KES 1,400" aria-label="Base fare" />
          <input className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" defaultValue="07:00, 13:00, 18:30" aria-label="Daily departures" />
        </div>
        <button className="mt-4 h-10 rounded-lg bg-[#005344] px-4 text-xs font-extrabold text-white">Create Corridor Schedule</button>

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-3">Corridor</th>
                <th className="p-3">Base Fare</th>
                <th className="p-3">Peak Fare</th>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Driver</th>
                <th className="p-3">Daily Times</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {routeRows.map(row => (
                <tr key={`${row.from}-${row.to}`} className="font-semibold text-slate-700">
                  <td className="p-3 font-extrabold text-slate-950">{row.from} to {row.to}</td>
                  <td className="p-3 font-mono">{formatKes(row.baseFare)}</td>
                  <td className="p-3 font-mono">{formatKes(row.peakFare)}</td>
                  <td className="p-3 font-mono">{row.vehicle}</td>
                  <td className="p-3">{row.driver}</td>
                  <td className="p-3">{row.times}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SettlementsPage() {
  const [sortAsc, setSortAsc] = useState(false);
  const rows = [...transactions].sort((a, b) => sortAsc ? a.amount - b.amount : b.amount - a.amount);
  const total = transactions.filter(item => item.status === "Success").reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="grid shrink-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard label="Total Collected Revenue" value={formatKes(total)} detail="Successful M-Pesa collections" icon={CreditCard} />
        <MetricCard label="Pending Settlements" value={formatKes(14800)} detail="Awaiting operator payout batch" icon={WalletCards} />
        <MetricCard label="Last Payout Timestamp" value="10:12 AM" detail="Saturday, May 30, 2026" icon={Clock} />
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-950">Transaction Ledger</h2>
            <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-red-600">
              <AlertTriangle className="h-4 w-4" />
              1 reconciliation discrepancy requires review.
            </p>
          </div>
          <button className="h-10 rounded-lg bg-[#005344] px-4 text-xs font-extrabold text-white">Initiate Bulk Operator Payout</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-4">M-Pesa Code</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Customer Phone</th>
                <th className="p-4">
                  <button onClick={() => setSortAsc(value => !value)} className="flex items-center gap-2 font-extrabold uppercase">
                    Amount <ArrowDownUp className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-4">Route</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => (
                <tr key={row.code} className={row.status === "Flagged" ? "bg-red-50/60" : "bg-white"}>
                  <td className="p-4 font-mono font-extrabold text-slate-950">{row.code}</td>
                  <td className="p-4 font-semibold text-slate-600">{row.timestamp}</td>
                  <td className="p-4 font-mono text-slate-700">{row.phone}</td>
                  <td className="p-4 font-mono font-extrabold text-slate-950">{formatKes(row.amount)}</td>
                  <td className="p-4 font-semibold text-slate-700">{row.route}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${row.status === "Success" ? "bg-emerald-50 text-emerald-700" : row.status === "Failed" ? "bg-slate-100 text-slate-500" : "bg-red-100 text-red-700"}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AnalyticsPage() {
  const corridors = [
    ["Nairobi to Eldoret", 92],
    ["Nairobi to Kitale", 78],
    ["Nairobi to Kisumu", 67],
    ["Eldoret to Nairobi", 58]
  ] as const;
  const hours = [28, 54, 86, 72, 38, 64, 91, 45];

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 overflow-y-auto xl:grid-cols-3">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <h2 className="font-extrabold text-slate-950">Busiest Travel Routes</h2>
        <div className="mt-5 space-y-4">
          {corridors.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex justify-between text-xs font-bold text-slate-600">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="h-8 rounded-lg bg-slate-100">
                <div className="flex h-full items-center rounded-lg bg-[#005344] px-3 text-[10px] font-extrabold text-white" style={{ width: `${value}%` }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-extrabold text-slate-950">Peak Booking Hours</h2>
        <div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-slate-200 px-3">
          {hours.map((value, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-md bg-amber-500" style={{ height: `${value}%` }} />
              <span className="text-[10px] font-bold text-slate-400">{index + 6}:00</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
        <h2 className="font-extrabold text-slate-950">Fleet Efficiency Scoreboard</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {fleet.map((vehicle, index) => (
            <article key={vehicle.plate} className="rounded-lg border border-slate-200 p-4">
              <p className="font-mono text-lg font-extrabold text-[#005344]">{vehicle.plate}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{12 - index} trips completed</p>
              <p className="mt-4 text-2xl font-extrabold text-slate-950">{formatKes(28400 - index * 4200)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function RegistryPage() {
  const [tab, setTab] = useState<RegistryTab>("fleet");

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Vehicle & Driver Registry</h2>
          <p className="text-xs text-slate-500">Asset validity, licensing, and current duty states.</p>
        </div>
        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {(["fleet", "drivers"] as RegistryTab[]).map(item => (
            <button key={item} onClick={() => setTab(item)} className={`h-9 rounded-md px-4 text-xs font-extrabold capitalize ${tab === item ? "bg-[#005344] text-white" : "text-slate-600"}`}>{item}</button>
          ))}
        </div>
      </div>

      {tab === "fleet" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {fleet.map(vehicle => (
            <article key={vehicle.plate} className="rounded-lg border border-slate-200 p-4">
              <Bus className="h-7 w-7 text-[#005344]" />
              <h3 className="mt-4 font-extrabold text-slate-950">{vehicle.model}</h3>
              <p className="mt-1 font-mono text-sm font-bold text-slate-600">{vehicle.plate}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">{vehicle.capacity} seats configured</p>
              <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${vehicle.severity === "red" ? "bg-red-100 text-red-700" : vehicle.severity === "amber" ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
                {vehicle.alert}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {drivers.map(driver => (
            <article key={driver.name} className="rounded-lg border border-slate-200 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-[#005344]">
                <UserRound className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-extrabold text-slate-950">{driver.name}</h3>
              <p className="mt-1 font-mono text-xs font-bold text-slate-500">{driver.phone}</p>
              <p className="mt-3 text-xs font-semibold text-slate-600">{driver.license}</p>
              <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${driver.state === "On-Trip" ? "bg-emerald-50 text-emerald-700" : driver.state === "Resting" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-500"}`}>
                {driver.state}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function SettingsPage() {
  const [traffic, setTraffic] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [permissions, setPermissions] = useState(roleDefaults);

  return (
    <div className="h-full min-h-0 overflow-y-auto space-y-4">
      <section className="rounded-lg border-2 border-red-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-red-600" />
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">Developer Testing Sandbox</h2>
            <p className="mt-1 text-xs font-semibold text-red-600">Simulation controls are isolated from operational pages to reduce accidental live-state changes.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => setTraffic(value => !value)} className={`h-11 rounded-lg px-4 text-xs font-extrabold ${traffic ? "bg-[#005344] text-white" : "bg-slate-100 text-slate-700"}`}>
            Simulate Ticket Traffic: {traffic ? "On" : "Off"}
          </button>
          <button onClick={() => setResetOpen(true)} className="h-11 rounded-lg border border-red-300 bg-red-50 px-4 text-xs font-extrabold text-red-700">
            RESET ALL LIVE STATE
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-950">Role-Based Access Control</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400">
              <tr>
                <th className="p-3">Role</th>
                {pages.map(page => <th key={page.id} className="p-3">{page.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(Object.keys(permissions) as RoleName[]).map(role => (
                <tr key={role}>
                  <td className="p-3 font-extrabold text-slate-950">{role}</td>
                  {pages.map(page => (
                    <td key={page.id} className="p-3">
                      <button
                        onClick={() => setPermissions(prev => ({ ...prev, [role]: { ...prev[role], [page.id]: !prev[role][page.id] } }))}
                        className={`h-7 w-12 rounded-full p-1 transition ${permissions[role][page.id] ? "bg-[#005344]" : "bg-slate-200"}`}
                      >
                        <span className={`block h-5 w-5 rounded-full bg-white transition ${permissions[role][page.id] ? "translate-x-5" : ""}`} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">Confirm Live-State Reset</h3>
                <p className="mt-1 text-xs text-slate-500">Mock guardrail: type operator password before enabling a destructive sandbox action.</p>
              </div>
              <button onClick={() => setResetOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">This would clear simulated bookings, settlements, and traffic state.</div>
            <input className="mt-4 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" placeholder="Mock password confirmation" type="password" />
            <button onClick={() => setResetOpen(false)} className="mt-4 h-10 w-full rounded-lg bg-red-600 text-xs font-extrabold text-white">Confirm Sandbox Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const stored = localStorage.getItem("tl_admin_account");
    return stored ? JSON.parse(stored) as AdminAccount : null;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("tl_theme") === "dark");
  const [showAddDeparture, setShowAddDeparture] = useState(false);
  const [departures, setDepartures] = useState<Departure[]>(INITIAL_DEPARTURES);
  const scopedDepartures = useMemo(
    () => departures.filter(departure => departure.operatorId === (currentAdmin?.operatorId ?? "north-rift")),
    [departures, currentAdmin]
  );
  const activeOperator = INITIAL_OPERATORS.find(operator => operator.id === (currentAdmin?.operatorId ?? "north-rift"));
  const activeLabel = pages.find(page => page.id === activePage)?.label ?? "Main Dashboard";

  useEffect(() => {
    localStorage.setItem("tl_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    if (currentAdmin) localStorage.setItem("tl_admin_account", JSON.stringify(currentAdmin));
    else localStorage.removeItem("tl_admin_account");
  }, [currentAdmin]);

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    const account = adminAccounts.find(
      admin => admin.username.toLowerCase() === username.trim().toLowerCase() && admin.password === password
    );
    if (!account) {
      setLoginError("Invalid shuttle admin username or password.");
      return;
    }
    setLoginError("");
    setCurrentAdmin(account);
  };

  const handleGoogleSignIn = () => {
    const account = adminAccounts[0];
    setUsername(account.username);
    setPassword("");
    setLoginError("");
    setCurrentAdmin(account);
  };

  const addDeparture = (departure: Omit<Departure, "id" | "occupiedSeats">) => {
    setDepartures(previous => [
      {
        ...departure,
        operatorId: currentAdmin?.operatorId ?? departure.operatorId,
        id: `admin-departure-${Date.now()}`,
        occupiedSeats: []
      },
      ...previous
    ]);
    setActivePage("dashboard");
  };

  if (!currentAdmin) {
    return (
      <div className={`${darkMode ? "theme-dark bg-slate-950" : "bg-slate-50"} flex min-h-screen items-center justify-center p-4 font-sans`}>
        <form onSubmit={handleLogin} className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-[#005344] p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <Bus className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black">Shuttle Admin Login</h1>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Operator-specific access</p>
                </div>
              </div>
              <button type="button" onClick={() => setDarkMode(value => !value)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Username</span>
              <input
                value={username}
                onChange={event => setUsername(event.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold"
                placeholder="northrift, mololine, or sharks"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Password</span>
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm" placeholder="admin123" autoComplete="current-password" />
            </label>
            {loginError && <p className="text-xs font-bold text-red-600">{loginError}</p>}
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#005344] text-sm font-black text-white">
              <LockKeyhole className="h-4 w-4" />
              Login to Shuttle Console
            </button>
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <button type="button" onClick={handleGoogleSignIn} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-700">
              <Chrome className="h-4 w-4 text-[#005344]" />
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "theme-dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"} flex h-screen overflow-hidden font-sans`}>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#005344] text-white">
              <Bus className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-extrabold text-[#005344]">{activeOperator?.name ?? "Shuttle Admin"}</h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Transit Enterprise</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {pages.map(page => <ShellButton key={page.id} page={page} active={page.id === activePage} onClick={() => setActivePage(page.id)} />)}
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs font-semibold text-slate-500">
          <p className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#005344]" /> Admin workspace</p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#005344]">{activeLabel}</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">{activeOperator?.name ?? "Shuttle"} Dashboard</h2>
              <p className="mt-1 text-sm text-slate-500">Logged in as {currentAdmin.name}. Manage only this shuttle's routes, seats, settlements, assets, and settings.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setDarkMode(value => !value)} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700">
                {darkMode ? <Sun className="h-4 w-4 text-[#005344]" /> : <Moon className="h-4 w-4 text-[#005344]" />}
                Dark Mode
              </button>
              <button onClick={() => { setCurrentAdmin(null); setPassword(""); }} className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700">
                <LogOut className="h-4 w-4 text-[#005344]" />
                Logout
              </button>
              <button onClick={() => setShowAddDeparture(true)} className="flex h-10 items-center gap-2 rounded-lg bg-[#005344] px-3 text-xs font-extrabold text-white">
                <Plus className="h-4 w-4" />
                Add New Departure
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {pages.map(page => (
              <button key={page.id} onClick={() => setActivePage(page.id)} className={`h-9 shrink-0 rounded-lg px-3 text-xs font-bold ${page.id === activePage ? "bg-[#005344] text-white" : "bg-slate-100 text-slate-600"}`}>
                {page.label}
              </button>
            ))}
          </div>
        </header>

        <section className="min-h-0 flex-1 overflow-hidden p-4 md:p-6">
          {activePage === "dashboard" && <MainDashboard departures={scopedDepartures} />}
          {activePage === "route-seating" && <RouteSeatingManager />}
          {activePage === "settlements" && <SettlementsPage />}
          {activePage === "analytics" && <AnalyticsPage />}
          {activePage === "registry" && <RegistryPage />}
          {activePage === "settings" && <SettingsPage />}
        </section>
      </main>
      {showAddDeparture && (
        <NewDepartureModal
          onAddDeparture={addDeparture}
          onClose={() => setShowAddDeparture(false)}
        />
      )}
    </div>
  );
}
