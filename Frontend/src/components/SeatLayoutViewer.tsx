/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Departure, Booking } from "../types";
import { CreditCard, Check, AlertTriangle, Users, Phone, ShieldCheck, RefreshCw } from "lucide-react";

interface SeatLayoutViewerProps {
  departure: Departure;
  onBookSeats: (seats: number[], passengerName: string, passengerPhone: string) => void;
  onReleaseSeat: (seatNum: number) => void;
}

export default function SeatLayoutViewer({ departure, onBookSeats, onReleaseSeat }: SeatLayoutViewerProps) {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"none" | "stk_sent" | "success">("none");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const capacity = departure.capacity;
  const occupied = departure.occupiedSeats;

  // Toggle seat selection
  const handleSeatClick = (seatNum: number) => {
    if (occupied.includes(seatNum)) {
      // Allow admin to release occupied seats
      if (confirm(`Do you want to manual cancel/release seat ${String(seatNum).padStart(2, '0')}?`)) {
        onReleaseSeat(seatNum);
      }
      return;
    }

    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      setSelectedSeats(prev => [...prev, seatNum]);
    }
  };

  // Run M-Pesa push simulation
  const handleSimulateMPesa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName || !passengerPhone) {
      alert("Please fill in both passenger name and phone number.");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat to book.");
      return;
    }

    setIsSimulatingPayment(true);
    setPaymentStep("stk_sent");

    // Simulate STK Push authorization delay (3 seconds)
    setTimeout(() => {
      setPaymentStep("success");
      setTimeout(() => {
        // Complete actual state-change booking
        onBookSeats(selectedSeats, passengerName, passengerPhone);
        
        // Reset local state
        setSelectedSeats([]);
        setPassengerName("");
        setPassengerPhone("");
        setPaymentStep("none");
        setIsSimulatingPayment(false);
      }, 2000);
    }, 2800);
  };

  // Generate seats layout structure
  // We'll organize seats into rows. 4 seats per row (2 matching the aisle layout).
  const renderSeats = () => {
    const seatsArray = [];
    const cols = 4;
    const rowsCount = Math.ceil(capacity / cols);

    for (let s = 1; s <= capacity; s++) {
      seatsArray.push(s);
    }

    return (
      <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
        {seatsArray.map((seatNum) => {
          const isOccupied = occupied.includes(seatNum);
          const isSelected = selectedSeats.includes(seatNum);
          const isAisleRight = seatNum % 4 === 2;

          return (
            <React.Fragment key={seatNum}>
              <button
                type="button"
                onClick={() => handleSeatClick(seatNum)}
                className={`
                  relative h-12 w-12 rounded-lg border font-bold text-sm transition-all duration-200 flex items-center justify-center
                  ${isOccupied 
                     ? "bg-[#e5e9eb] border-[#bec9c4] text-[#bec9c4] cursor-pointer" 
                     : isSelected
                     ? "bg-[#005344] border-[#005344] text-white hover:bg-[#004236]"
                     : "bg-white border-slate-200 text-[#005344] hover:border-[#005344] hover:bg-slate-50 cursor-pointer"
                  }
                `}
                title={isOccupied ? "Click to Free/Release seat" : `Seat ${seatNum}`}
              >
                <span>{String(seatNum).padStart(2, '0')}</span>
                
                {/* Diagonal strike-through line for occupied seats */}
                {isOccupied && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[140%] h-[1px] bg-[#bec9c4] rotate-45 transform"></div>
                  </div>
                )}
              </button>

              {/* Aisle space injection */}
              {isAisleRight && <div className="w-4" />}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const totalPrice = selectedSeats.length * departure.fare;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Bus layout */}
      <div className="lg:col-span-6 bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#005344]" />
              Select Seats for Route
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-mono uppercase font-semibold">
              {departure.vehicleType} Vehicle
            </span>
          </div>

          {/* Seat State legends matching the screenshot */}
          <div className="flex gap-4 justify-center text-[11px] font-semibold text-slate-500 mb-6 bg-white py-2 px-3 rounded-lg border border-slate-200/50">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#005344]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-[#e5e9eb] border border-[#bec9c4] relative overflow-hidden">
                <div className="absolute inset-0 border-t border-[#bec9c4] rotate-45 scale-150"></div>
              </div>
              <span>Occupied</span>
            </div>
          </div>

          {/* Core Bus Frame */}
          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative pt-12 overflow-hidden">
            {/* Steering Wheel/Driver Area representation */}
            <div className="absolute top-3 right-6 flex items-center justify-center opacity-40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-2">Driver</span>
              <div className="w-8 h-8 rounded-full border-2 border-slate-400 flex items-center justify-center border-dashed font-mono font-bold text-xs text-slate-400">
                🛞
              </div>
            </div>

            {/* Dashboard border */}
            <div className="w-full border-b border-dashed border-slate-200 pb-4 mb-6"></div>

            {/* Render dynamically organized grid */}
            {renderSeats()}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 flex items-start gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Manual release: clicking an occupied (gray) seat will prompt the manager to cancel or refund the seat instantly.</span>
        </div>
      </div>

      {/* Booking Form and payment simulator */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Booking panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 text-sm uppercase tracking-wider text-[#005344]">
            Manual Reservation & STK Trigger
          </h4>

          {selectedSeats.length === 0 ? (
            <div className="h-44 flex flex-col justify-center items-center text-center p-6 border-2 border-dashed border-slate-200 rounded-lg">
              <Users className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No seats selected</p>
              <p className="text-xs text-slate-400 mt-1">Click on any empty seat on the left bus layout to begin booking.</p>
            </div>
          ) : (
            <form onSubmit={handleSimulateMPesa} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800 flex justify-between items-center font-mono">
                <div>
                  <span className="block font-semibold">SELECTED SEATS:</span>
                  <span className="text-base font-bold text-[#005344]">
                    {selectedSeats.map(s => String(s).padStart(2, '0')).sort().join(", ")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">TOTAL TRANSACTION AMOUNT:</span>
                  <span className="text-base font-bold text-slate-950 font-sans">
                    KES {totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Passenger Name
                </label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  placeholder="e.g. Felix Omondi"
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005344] focus:border-[#005344] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                  Registered M-Pesa Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">+254</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{9}"
                    value={passengerPhone}
                    onChange={e => setPassengerPhone(e.target.value)}
                    placeholder="738836122"
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg pl-14 pr-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005344] focus:border-[#005344] transition-all font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Exclude first 0 or +254 (e.g. 738836122)</span>
              </div>

              {/* simulated payment popup inside view */}
              {isSimulatingPayment && (
                <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden animate-pulse">
                  {paymentStep === "stk_sent" ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                        </div>
                        <h5 className="font-bold text-sm text-orange-400">STK Push Signal Transmitted</h5>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        Prompt dispatched to <span className="text-white underline">+254 {passengerPhone}</span>.<br />
                        Awaiting user to input M-Pesa PIN for KES {totalPrice.toLocaleString()}...
                      </p>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full animate-progress" style={{ animationDuration: '2.8s' }}></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                        <h5 className="font-bold text-sm">M-PESA DEPOSIT CHARGED</h5>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">
                        Instant STK transaction confirmed! Issue transaction clearance voucher TLNK-X{Math.floor(Math.random() * 90000) + 10000}.
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-300 tracking-wider">
                        <Check className="w-4 h-4" /> Finalizing Ticket Voucher...
                      </div>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSimulatingPayment}
                className={`
                  w-full h-11 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm
                  ${isSimulatingPayment 
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed" 
                    : "bg-[#a63b00] hover:bg-[#8f3200] text-white active:scale-[0.98]"
                  }
                `}
              >
                <CreditCard className="w-4 h-4" />
                {isSimulatingPayment ? "Processing via Safaricom..." : `Trigger M-Pesa STK (KES ${totalPrice.toLocaleString()})`}
              </button>

              <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                Clicking will trigger a simulated STK Push representing official operator collection loops.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
