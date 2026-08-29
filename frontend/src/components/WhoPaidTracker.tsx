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
      <div className="bg-[#fcfaf5] p-6 rounded-[12px] border border-[#b6b6b6] text-center font-mono text-xs text-[#1a3300]/60">
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
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#cb5521] text-[#fcfaf5] border border-[#1a3300] rounded-full flex items-center gap-1 font-bold shadow-sm">
            <Flame className="w-3 h-3 text-[#fcfaf5]" />
            <span>Stage 4: Overdue</span>
          </span>
        );
      case 'STAGE_3_DEADLINE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#ffe95c] text-[#1a3300] border border-[#1a3300] rounded-full flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3 h-3 text-[#1a3300]" />
            <span>Stage 3: Deadline</span>
          </span>
        );
      case 'STAGE_2_NUDGE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#f6d0ff] text-[#1a3300] border border-[#1a3300] rounded-full flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[#1a3300]" />
            <span>Stage 2: Firm Nudge</span>
          </span>
        );
      case 'STAGE_1_ANNOUNCE':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono bg-[#a8e5e5] text-[#1a3300] border border-[#1a3300] rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#1a3300]" />
            <span>Stage 1: Announced</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#fcfaf5] p-6 space-y-6 rounded-[12px] border border-[#1a3300] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ffe95c] border border-[#1a3300] text-[#1a3300] rounded-[6px]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-[#1a3300] flex items-center gap-2">
              <span>Settlement Matrix</span>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full">
                Who Paid vs Who Is Left
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#1a3300]/70 mt-1 font-sans">
            Live household debt clearance tracker & automated escalation status
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#1a3300]/70">Progress:</span>
          <span className="font-bold text-[#1a3300] bg-[#d5f5c2] px-2 py-0.5 rounded-[4px] border border-[#1a3300] text-xs">
            {cleared_percentage.toFixed(1)}% Settled
          </span>
        </div>
      </div>

      {/* Aggregate Overview Bar */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 p-3 bg-[#fcfaf5] rounded-[8px] border border-[#b6b6b6] text-center font-mono">
          <div>
            <div className="text-[10px] text-[#1a3300]/60 uppercase tracking-wider">Total Billed</div>
            <div className="text-sm sm:text-base font-bold text-[#1a3300]">₹{total_billed.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#1a3300] uppercase tracking-wider flex items-center justify-center gap-1">
              <UserCheck className="w-3 h-3" /> Total Paid
            </div>
            <div className="text-sm sm:text-base font-bold text-[#1a3300]">₹{total_paid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[10px] text-[#cb5521] uppercase tracking-wider flex items-center justify-center gap-1 font-bold">
              <UserX className="w-3 h-3 text-[#cb5521]" /> Outstanding
            </div>
            <div className="text-sm sm:text-base font-bold text-[#cb5521]">₹{total_pending.toFixed(2)}</div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#e8e4d9] rounded-full h-2.5 overflow-hidden border border-[#b6b6b6]">
          <div
            className="bg-[#1a3300] h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, cleared_percentage))}%` }}
          />
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#b6b6b6] pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-1.5 px-3 rounded-[6px] font-mono text-xs transition-transform active:scale-[0.97] flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-[#1a3300] text-[#fcfaf5] font-semibold shadow-sm'
              : 'text-[#1a3300] bg-[#fcfaf5] border border-[#b6b6b6] hover:border-[#1a3300]'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Left to Pay ({pending_members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          className={`py-1.5 px-3 rounded-[6px] font-mono text-xs transition-transform active:scale-[0.97] flex items-center gap-2 ${
            activeTab === 'paid'
              ? 'bg-[#1a3300] text-[#fcfaf5] font-semibold shadow-sm'
              : 'text-[#1a3300] bg-[#fcfaf5] border border-[#b6b6b6] hover:border-[#1a3300]'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Paid Roommates ({paid_members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`py-1.5 px-3 rounded-[6px] font-mono text-xs transition-transform active:scale-[0.97] flex items-center gap-2 ${
            activeTab === 'bills'
              ? 'bg-[#1a3300] text-[#fcfaf5] font-semibold shadow-sm'
              : 'text-[#1a3300] bg-[#fcfaf5] border border-[#b6b6b6] hover:border-[#1a3300]'
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
            <div className="p-6 bg-[#d5f5c2] rounded-[8px] border border-[#1a3300] text-center font-mono text-xs text-[#1a3300] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#1a3300]" />
              <span>All roommates have cleared their outstanding shares! Zero debt remaining.</span>
            </div>
          ) : (
            pending_members.map((member) => (
              <div
                key={member.roommate_id}
                className="p-4 bg-[#fcfaf5] rounded-[8px] border border-[#cb5521] hover:border-[#1a3300] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[6px] bg-[#f6d0ff] border border-[#1a3300] flex items-center justify-center text-[#1a3300] font-bold text-xs">
                    {member.roommate_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a3300] flex items-center gap-2">
                      <span>{member.roommate_name}</span>
                      <span className="text-[10px] font-mono text-[#1a3300]/60">
                        ({member.pending_shares_count} unpaid {member.pending_shares_count === 1 ? 'bill' : 'bills'})
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#1a3300]/80">{member.upi_vpa}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#b6b6b6]/40">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-sm font-bold text-[#cb5521]">
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
            <div className="p-6 bg-[#fcfaf5] rounded-[8px] border border-dashed border-[#b6b6b6] text-center font-mono text-xs text-[#1a3300]/60">
              No roommates have fully cleared their bills yet.
            </div>
          ) : (
            paid_members.map((member) => (
              <div
                key={member.roommate_id}
                className="p-4 bg-[#d5f5c2] rounded-[8px] border border-[#1a3300] flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[6px] bg-[#fcfaf5] border border-[#1a3300] flex items-center justify-center text-[#1a3300] font-bold text-xs">
                    {member.roommate_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a3300] flex items-center gap-2">
                      <span>{member.roommate_name}</span>
                      <span className="px-2 py-0.5 text-[9px] font-mono bg-[#fcfaf5] text-[#1a3300] border border-[#1a3300] rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>All Cleared</span>
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#1a3300]/70">{member.upi_vpa}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs text-[#1a3300]/60">Total Settled</div>
                  <div className="font-mono text-sm font-bold text-[#1a3300]">
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
            <div className="p-6 bg-[#fcfaf5] rounded-[8px] border border-dashed border-[#b6b6b6] text-center font-mono text-xs text-[#1a3300]/60">
              No bills recorded for this household.
            </div>
          ) : (
            bills_summary.map((bill) => {
              const isExpanded = expandedBillId === bill.expense_id;
              return (
                <div
                  key={bill.expense_id}
                  className="rounded-[8px] border border-[#1a3300] bg-[#fcfaf5] overflow-hidden transition-colors"
                >
                  <div
                    onClick={() => setExpandedBillId(isExpanded ? null : bill.expense_id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#e8e4d9]/40 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#1a3300] flex items-center gap-2">
                        <span>{bill.vendor}</span>
                        {bill.is_fully_settled ? (
                          <span className="px-2 py-0.5 text-[9px] font-mono bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full">
                            Fully Settled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-mono bg-[#ffe95c] text-[#1a3300] border border-[#1a3300] rounded-full">
                            {bill.paid_count}/{bill.paid_count + bill.unpaid_count} Paid
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[#1a3300]/70 mt-0.5">
                        Payer: <span className="font-semibold text-[#1a3300]">{bill.payer_name}</span> • Due: {bill.due_date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-[#1a3300]">
                          ₹{bill.total_amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] font-mono text-[#1a3300]/60">{bill.category}</span>
                      </div>
                      <button className="p-1 text-[#1a3300] hover:bg-[#ffe95c] rounded-[4px] transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Individual Shares Drawer */}
                  {isExpanded && (
                    <div className="p-3 bg-[#e8e4d9]/30 border-t border-[#b6b6b6] space-y-2">
                      <div className="text-[10px] font-mono text-[#1a3300]/60 uppercase tracking-wider px-1">
                        Individual Roommate Shares:
                      </div>
                      {bill.shares.map((share) => {
                        const isPaid = share.status === 'PAID';
                        return (
                          <div
                            key={share.id}
                            className="p-2.5 bg-[#fcfaf5] rounded-[6px] border border-[#b6b6b6] flex items-center justify-between text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[#1a3300] font-medium">{share.roommate_name}</span>
                              {renderEscalationBadge(share.escalation_stage)}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={isPaid ? 'text-[#1a3300] font-bold' : 'text-[#cb5521] font-bold'}>
                                ₹{share.amount_owed.toFixed(2)}
                              </span>
                              {isPaid ? (
                                <span className="text-[9px] px-2 py-0.5 bg-[#d5f5c2] text-[#1a3300] rounded-full border border-[#1a3300]">
                                  PAID
                                </span>
                              ) : (
                                onPayShare && (
                                  <button
                                    onClick={() => onPayShare(share)}
                                    className="px-2.5 py-0.5 bg-[#1a3300] hover:bg-[#1a3300]/90 text-[#fcfaf5] rounded-[6px] text-[10px] font-semibold transition-transform active:scale-[0.97]"
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
