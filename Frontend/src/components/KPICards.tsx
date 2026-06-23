/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp, Users, Truck, Sparkles } from "lucide-react";

interface KPICardsProps {
  dailyRevenue: number;
  revenueGrowth: number;
  totalPassengers: number;
  utilization: number;
  totalVehicles: number;
  operatorName: string;
}

export default function KPICards({
  dailyRevenue,
  revenueGrowth,
  totalPassengers,
  utilization,
  totalVehicles,
  operatorName,
}: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Revenue Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
            Daily Revenue ({operatorName})
          </span>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-1">
            KES {dailyRevenue.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{revenueGrowth}% from yesterday</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#005344] flex items-center justify-center border border-emerald-100">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      {/* Passengers Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
            Total Passengers
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalPassengers.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Captured across all live departures today
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Fleet Status Card */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between hover:border-slate-300 transition-all hover:-translate-y-0.5 duration-200">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
            Fleet Deployment
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalVehicles} Vehicles
          </p>
          <p className="text-xs text-slate-500 mt-2 font-semibold">
            All registered operator coaches
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
          <Truck className="w-5 h-5" />
        </div>
      </div>

      {/* Fleet Utilization Card (Special visual bento styling) */}
      <div className="bg-[#005344] text-white p-5 rounded-xl flex items-center justify-between overflow-hidden relative shadow-sm group hover:-translate-y-0.5 transition-all duration-200 col-span-1 border border-[#003d32]">
        <div className="z-10 w-full">
          <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase block">
            Capacity Utilization
          </span>
          <p className="text-2xl font-bold mt-1">
            {utilization}% Filled
          </p>
          <div className="mt-3 w-full bg-emerald-950/50 h-2 rounded-full overflow-hidden border border-[#00604f]">
            <div 
              className="bg-emerald-300 h-full rounded-full transition-all duration-500" 
              style={{ width: `${utilization}%` }}
            ></div>
          </div>
        </div>
        
        {/* Absolute Background element as watermark */}
        <div className="absolute right-[-10px] bottom-[-15px] text-emerald-950/30 opacity-90 scale-125 transform pointer-events-none transition-transform duration-500 group-hover:scale-135 shrink-0">
          <Truck className="w-24 h-24 stroke-[1]" />
        </div>
      </div>
    </div>
  );
}
