/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Departure, OperatorId, DepartureStatus } from "../types";
import { Plus, X, Calendar, Bus, DollarSign, Clock, Users } from "lucide-react";

interface NewDepartureModalProps {
  onAddDeparture: (newDep: Omit<Departure, "id" | "occupiedSeats">) => void;
  onClose: () => void;
}

export default function NewDepartureModal({ onAddDeparture, onClose }: NewDepartureModalProps) {
  const [operatorId, setOperatorId] = useState<OperatorId>("mololine");
  const [from, setFrom] = useState("Nairobi");
  const [to, setTo] = useState("Eldoret");
  const [fare, setFare] = useState(1500);
  const [departTime, setDepartTime] = useState("08:00 AM");
  const [date, setDate] = useState("2026-06-01");
  const [vehiclePlate, setVehiclePlate] = useState("KCQ 482A");
  const [capacity, setCapacity] = useState(14);
  const [status, setStatus] = useState<DepartureStatus>("SCHEDULED");
  const [driverName, setDriverName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName) {
      alert("Please supply a registered Driver Name for this departure.");
      return;
    }
    
    // Convert numerical capacity type string matching
    const vehicleType = capacity === 11 ? "11-Seater" : capacity === 20 ? "20-Seater" : "14-Seater";

    onAddDeparture({
      operatorId,
      from,
      to,
      fare,
      departTime,
      date,
      vehiclePlate,
      vehicleType,
      capacity,
      status,
      driverName
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden my-8 border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#005344] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-lg">Schedule New Operator Departure</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-[#004236] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Operator Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Primary Carrier Operator
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value as OperatorId)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#005344] select-custom cursor-pointer"
            >
              <option value="mololine">Mololine Shuttle</option>
              <option value="north-rift">North Rift Shuttle</option>
              <option value="sharks">Sharks Premium</option>
            </select>
          </div>

          {/* Grid Layout for Route Destination / Fare / Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Departure Terminal (From)
              </label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-[#dee2e6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#005344] cursor-pointer"
              >
                <option value="Nairobi">Nairobi</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Eldoret">Eldoret</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Kitale">Kitale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Arival Terminal (To)
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-[#dee2e6] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#005344] cursor-pointer"
              >
                <option value="Eldoret">Eldoret</option>
                <option value="Nakuru">Nakuru</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Kitale">Kitale</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Ticket Fare (KES)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">KES</span>
                <input
                  type="number"
                  required
                  min={100}
                  step={50}
                  value={fare}
                  onChange={(e) => setFare(Number(e.target.value))}
                  className="w-full h-10 pl-11 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#005344] font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Departure Time slot
              </label>
              <input
                type="text"
                required
                value={departTime}
                onChange={(e) => setDepartTime(e.target.value)}
                placeholder="e.g. 7:45 AM or 1:00 PM"
                className="w-full h-10 px-3 bg-slate-50 border border-[#dee2e6] rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#005344]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Vehicle Plate Number
              </label>
              <input
                type="text"
                required
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                placeholder="e.g. KCQ 482A"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold tracking-wider uppercase font-mono focus:outline-none focus:ring-1 focus:ring-[#005344]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Seating Capacity Layout
              </label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#005344] cursor-pointer"
              >
                <option value={11}>11-Seater Shuttle Layout</option>
                <option value={14}>14-Seater Standard Layout</option>
                <option value={20}>20-Seater Super-Coach Layout</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Status Pre-Set
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DepartureStatus)}
                className="w-full h-10 px-3 bg-slate-50 border border-[#dee2e6] rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#005344] cursor-pointer"
              >
                <option value="SCHEDULED">SCHEDULED (Pre-Sale)</option>
                <option value="BOARDING">BOARDING (Immediate)</option>
                <option value="LIVE">LIVE (Departing now)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assigned Driver
              </label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Felix Omondi"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#005344]"
              />
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-6 bg-[#005344] hover:bg-[#004236] text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule Departure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
