/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Transaction, OperatorId } from "../types";
import { Search, Filter, Phone, CheckCircle2, XCircle, AlertCircle, Calendar, RefreshCw } from "lucide-react";

interface TransactionLogsProps {
  transactions: Transaction[];
  onTriggerMockRefund: (id: string) => void;
}

export default function TransactionLogs({ transactions, onTriggerMockRefund }: TransactionLogsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [operatorFilter, setOperatorFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = 
      txn.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.phone.includes(searchQuery) ||
      txn.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOperator = operatorFilter === "ALL" || txn.operatorId === operatorFilter;
    const matchesStatus = statusFilter === "ALL" || txn.status === statusFilter;

    return matchesSearch && matchesOperator && matchesStatus;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header Block */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">M-Pesa STK Push Settlement Records</h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time reconciliation feed for TransitLink ticket payouts.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-full font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          RECONCILIATION FEED STATE: ONLINE
        </div>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search passenger name, phone number, voucher..."
            className="w-full h-10 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005344] focus:border-[#005344] transition-all"
          />
        </div>

        {/* Operator Filter */}
        <div className="relative w-full md:w-48">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005344] select-custom cursor-pointer"
          >
            <option value="ALL">All Operators</option>
            <option value="mololine">Mololine Shuttle</option>
            <option value="north-rift">North Rift Shuttle</option>
            <option value="sharks">Sharks Premium</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005344] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Cleared (Success)</option>
            <option value="SENT">In-Flight (Sent)</option>
            <option value="FAILED">Declined (Failed)</option>
          </select>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <th className="p-4">Reference ID / Date</th>
              <th className="p-4">Operator</th>
              <th className="p-4">Passenger Contact</th>
              <th className="p-4">Settlement Sum</th>
              <th className="p-4">Gateway Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-500">No transaction records found</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try softening your query filters.</p>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => {
                const isSuccess = txn.status === "SUCCESS";
                const isSent = txn.status === "SENT";

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID / Date */}
                    <td className="p-4 font-mono">
                      <div className="font-bold text-slate-800">{txn.id}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        {new Date(txn.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>

                    {/* Operator Tag */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase
                        ${txn.operatorId === "mololine" 
                          ? "bg-teal-50 text-teal-800" 
                          : txn.operatorId === "north-rift"
                          ? "bg-blue-50 text-blue-800"
                          : "bg-orange-50 text-orange-850"
                        }
                      `}>
                        {txn.operatorId.replace("-", " ")}
                      </span>
                    </td>

                    {/* Passenger and Phone */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{txn.passengerName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                        <Phone className="w-3 h-3 text-slate-300" />
                        +254 {txn.phone}
                      </div>
                    </td>

                    {/* Charge Amount */}
                    <td className="p-4 font-semibold text-slate-900 font-mono">
                      KES {txn.amount.toLocaleString()}
                    </td>

                    {/* Gateway Status Badge */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                        {isSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-emerald-700">Cleared</span>
                          </>
                        ) : isSent ? (
                          <>
                            <div className="relative flex h-3.5 w-3.5 shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500"></span>
                            </div>
                            <span className="text-orange-600 animate-pulse font-mono pl-1">In Custody</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="text-red-700">Declined</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Actions / Refund audit tool */}
                    <td className="p-4 text-right">
                      {isSuccess ? (
                        <button
                          onClick={() => {
                            if (confirm(`Do you wish to issue a full refund of KES ${txn.amount} to via M-Pesa?`)) {
                              onTriggerMockRefund(txn.id);
                            }
                          }}
                          className="text-[10px] uppercase tracking-wider font-bold text-red-600 hover:text-red-800 hover:underline transition-colors cursor-pointer"
                        >
                          Trigger Refund
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
