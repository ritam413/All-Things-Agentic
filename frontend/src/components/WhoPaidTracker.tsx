'use client';

import React, { useState } from 'react';
import {
  HouseholdSettlementStatus,
  MemberPaymentSummary,
  BillShareStatusSummary,
  SplitShare,
  EscalationStage,
} from '../../../shared/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  ChevronDown,
  ChevronUp,
  CreditCard,
  QrCode,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserX,
  Zap,
} from 'lucide-react';

interface WhoPaidTrackerProps {
  settlementStatus: HouseholdSettlementStatus | null;
  onPayShare?: (share: SplitShare) => void;
  onRefresh?: () => void;
}

export function WhoPaidTracker({ settlementStatus, onPayShare, onRefresh }: WhoPaidTrackerProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'bills'>('pending');
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  if (!settlementStatus) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-cyan-500/20 text-center font-mono text-xs text-gray-500">
        Loading household settlement matrix...
      </div>
    );
  }

  const {
    total_billed,
    total_paid,
    total_pending,
    cleared_percentage,
    paid_members,
    pending_members,
    bills_summary,
  } = settlementStatus;

  const renderEscalationBadge = (stage?: EscalationStage | null) => {
    switch (stage) {
      case 'STAGE_4_OVERDUE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded-full flex items-center gap-1 animate-pulse font-bold">
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Stage 4: Overdue Flag</span>
          </span>
        );
      case 'STAGE_3_DEADLINE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-full flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Stage 3: Deadline Approaching</span>
          </span>
        );
      case 'STAGE_2_NUDGE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span>Stage 2: Firm Nudge</span>
          </span>
        );
      case 'STAGE_1_ANNOUNCE':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Stage 1: Announced</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-card p-6 space-y-6 rounded-2xl border border-cyan-500/20 bg-slate-950/70 shadow-2xl">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <span>Settlement Matrix</span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                Who Paid vs Who Is Left
              </span>
            </h3>
          </div>
          <p className="text-xs font-mono text-gray-400 mt-1">
            Live household debt clearance tracker & automated escalation monitor
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-gray-400">Progress:</span>
          <span className="font-bold text-cyan-400 text-sm">{cleared_percentage.toFixed(1)}% Settled</span>
        </div>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center font-mono">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Total Billed</div>
            <div className="text-sm sm:text-base font-bold text-white">₹{total_billed.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <UserCheck className="w-3 h-3" /> Total Paid
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-400">₹{total_paid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-rose-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <UserX className="w-3 h-3" /> Outstanding
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-400">₹{total_pending.toFixed(2)}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500 ease-out shadow-lg shadow-cyan-500/20"
            style={{ width: `${Math.min(100, Math.max(0, cleared_percentage))}%` }}
          />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-1.5 px-3 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Left to Pay ({pending_members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          className={`py-1.5 px-3 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
            activeTab === 'paid'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Paid Roommates ({paid_members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`py-1.5 px-3 rounded-xl font-mono text-xs transition-all flex items-center gap-2 ${
            activeTab === 'bills'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Bills Breakdown ({bills_summary.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING MEMBERS (LEFT TO PAY) */}
      {activeTab === 'pending' && (
        <div className="space-y-3">
          {pending_members.length === 0 ? (
            <div className="p-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center font-mono text-xs text-emerald-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All roommates have cleared their outstanding shares! Zero debt remaining.</span>
            </div>
          ) : (
            pending_members.map((member) => (
              <div
                key={member.roommate_id}
                className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 hover:border-rose-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {member.roommate_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>{member.roommate_name}</span>
                      <span className="text-[10px] font-mono text-gray-500">
                        ({member.pending_shares_count} unpaid {member.pending_shares_count === 1 ? 'bill' : 'bills'})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-400">{member.upi_vpa}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-sm font-bold text-rose-400">
                      ₹{member.total_pending.toFixed(2)}
                    </div>
                    <div className="mt-0.5">{renderEscalationBadge(member.highest_escalation_stage)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PAID MEMBERS */}
      {activeTab === 'paid' && (
        <div className="space-y-3">
          {paid_members.length === 0 ? (
            <div className="p-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center font-mono text-xs text-gray-500">
              No roommates have fully cleared their bills yet.
            </div>
          ) : (
            paid_members.map((member) => (
              <div
                key={member.roommate_id}
                className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 hover:border-emerald-500/40 transition-all flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {member.roommate_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>{member.roommate_name}</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>All Cleared</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-400">{member.upi_vpa}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs text-gray-500">Total Settled</div>
                  <div className="font-mono text-sm font-bold text-emerald-400">
                    ₹{member.total_paid.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: BILLS SUMMARY & SHARES ACCORDION */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          {bills_summary.length === 0 ? (
            <div className="p-6 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center font-mono text-xs text-gray-500">
              No bills recorded for this household.
            </div>
          ) : (
            bills_summary.map((bill) => {
              const isExpanded = expandedBillId === bill.expense_id;
              return (
                <div
                  key={bill.expense_id}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-colors"
                >
                  <div
                    onClick={() => setExpandedBillId(isExpanded ? null : bill.expense_id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{bill.vendor}</span>
                        {bill.is_fully_settled ? (
                          <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                            Fully Settled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
                            {bill.paid_count}/{bill.paid_count + bill.unpaid_count} Paid
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        Payer: <span className="text-cyan-300">{bill.payer_name}</span> • Due: {bill.due_date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-white">
                          ₹{bill.total_amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">{bill.category}</span>
                      </div>
                      <button className="p-1 text-gray-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Individual Shares Drawer */}
                  {isExpanded && (
                    <div className="p-3 bg-slate-950/90 border-t border-slate-900 space-y-2 animate-in slide-in-from-top-1">
                      <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider px-1">
                        Individual Roommate Shares:
                      </div>
                      {bill.shares.map((share) => {
                        const isPaid = share.status === 'PAID';
                        return (
                          <div
                            key={share.id}
                            className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-200">{share.roommate_name}</span>
                              {renderEscalationBadge(share.escalation_stage)}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={isPaid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                ₹{share.amount_owed.toFixed(2)}
                              </span>
                              {isPaid ? (
                                <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                                  PAID
                                </span>
                              ) : (
                                onPayShare && (
                                  <button
                                    onClick={() => onPayShare(share)}
                                    className="px-2.5 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded border border-cyan-500/40 text-[10px] font-semibold transition-all"
                                  >
                                    Pay UPI ↗
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
