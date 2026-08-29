'use client';

import React, { useState, useEffect } from 'react';
import {
  Household,
  Roommate,
  SplitRuleType,
  CreateHouseholdRequest,
  AddMemberRequest,
} from '../../../shared/types';
import {
  fetchHouseholds,
  createHousehold,
  addHouseholdMember,
  removeHouseholdMember,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Users,
  PlusCircle,
  X,
  Check,
  Building,
  UserPlus,
  Trash2,
  QrCode,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  DollarSign,
} from 'lucide-react';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHouseholdId: string;
  onSelectHousehold: (householdId: string) => void;
  onHouseholdUpdated: () => void;
}

type TabType = 'switch' | 'create_group' | 'add_member' | 'members_list';

export function GroupManagementModal({
  isOpen,
  onClose,
  currentHouseholdId,
  onSelectHousehold,
  onHouseholdUpdated,
}: GroupManagementModalProps) {
  const { currentUser, token } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('switch');
  const [households, setHouseholds] = useState<Household[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New Group Form State
  const [groupName, setGroupName] = useState('');
  const [groupCurrency, setGroupCurrency] = useState('INR');
  const [groupSplitRule, setGroupSplitRule] = useState<SplitRuleType>('EQUAL');

  // Add Member Form State
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberUpi, setMemberUpi] = useState('');
  const [memberSqFt, setMemberSqFt] = useState<number>(180);
  const [memberCustomPct, setMemberCustomPct] = useState<number | undefined>(undefined);

  const loadAllHouseholds = async () => {
    setIsLoading(true);
    try {
      const list = await fetchHouseholds(undefined, token || undefined);
      setHouseholds(list);
    } catch (err: any) {
      console.error('Failed to load households:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllHouseholds();
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const currentHousehold = households.find((h) => h.id === currentHouseholdId) || households[0];

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: CreateHouseholdRequest = {
        name: groupName.trim(),
        default_currency: groupCurrency,
        default_split_rule: groupSplitRule,
        creator_user_id: currentUser?.id,
      };

      const newHh = await createHousehold(payload, token || undefined);
      setSuccessMsg(`Household "${newHh.name}" successfully created!`);
      setGroupName('');
      await loadAllHouseholds();
      onSelectHousehold(newHh.id);
      onHouseholdUpdated();
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('switch');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create household');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHousehold) {
      setErrorMsg('No active household selected');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: AddMemberRequest = {
        name: memberName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim() || undefined,
        upi_vpa: memberUpi.trim(),
        room_sq_ft: Number(memberSqFt) || 180,
        custom_split_pct: memberCustomPct ? Number(memberCustomPct) : undefined,
      };

      const added = await addHouseholdMember(currentHousehold.id, payload);
      setSuccessMsg(`Added ${added.name} to ${currentHousehold.name}!`);
      setMemberName('');
      setMemberEmail('');
      setMemberPhone('');
      setMemberUpi('');
      setMemberSqFt(180);
      setMemberCustomPct(undefined);

      await loadAllHouseholds();
      onHouseholdUpdated();
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('members_list');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add roommate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (roommateId: string, roommateName: string) => {
    if (!currentHousehold) return;
    if (!confirm(`Are you sure you want to remove ${roommateName} from this household?`)) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await removeHouseholdMember(currentHousehold.id, roommateId);
      setSuccessMsg(`Removed ${roommateName} from household.`);
      await loadAllHouseholds();
      onHouseholdUpdated();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-card border border-cyan-500/30 p-6 md:p-8 space-y-6 shadow-2xl bg-[#0d1322]/95 rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <span>Household & Group Ops</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Multi-Group Engine
                </span>
              </h3>
              <p className="text-xs font-mono text-gray-400">
                Active: <span className="text-cyan-300 font-semibold">{currentHousehold?.name || currentHouseholdId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-2 px-3 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'switch'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Switch Group</span>
          </button>

          <button
            onClick={() => setActiveTab('create_group')}
            className={`flex-1 py-2 px-3 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create_group'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Group</span>
          </button>

          <button
            onClick={() => setActiveTab('add_member')}
            className={`flex-1 py-2 px-3 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add_member'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Roommate</span>
          </button>

          <button
            onClick={() => setActiveTab('members_list')}
            className={`flex-1 py-2 px-3 text-xs font-mono rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'members_list'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({currentHousehold?.roommates?.length || 0})</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: SWITCH GROUP */}
        {activeTab === 'switch' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-400 font-sans">
              Select an active household ledger to manage expenses, Min-Cash-Flow debts, and escalation schedules.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {households.map((hh) => {
                const isSelected = hh.id === currentHouseholdId;
                return (
                  <div
                    key={hh.id}
                    onClick={() => {
                      onSelectHousehold(hh.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{hh.name}</span>
                          {isSelected && (
                            <span className="px-2 py-0.5 text-[9px] font-mono bg-cyan-500 text-black font-bold rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400 mt-0.5">ID: {hh.id}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 text-purple-300 border border-purple-500/30 rounded">
                        {hh.default_split_rule}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{hh.roommates.length} Roommates</span>
                      </span>
                      <span className="text-gray-500">{hh.default_currency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE NEW GROUP */}
        {activeTab === 'create_group' && (
          <form onSubmit={handleCreateGroup} className="space-y-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-gray-300 font-medium">Household / Flat Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Villa 101 - Green Meadows"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Default Currency</label>
                <input
                  type="text"
                  value={groupCurrency}
                  onChange={(e) => setGroupCurrency(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Default Split Rule</label>
                <select
                  value={groupSplitRule}
                  onChange={(e) => setGroupSplitRule(e.target.value as SplitRuleType)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="EQUAL">EQUAL (50/50)</option>
                  <option value="ROOM_AREA">ROOM_AREA (Sq Ft Weighted)</option>
                  <option value="PERCENTAGE">PERCENTAGE (Custom %)</option>
                  <option value="ITEMIZED">ITEMIZED (Per Item)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-[11px] text-gray-400 font-mono">
              💡 Creating a group automatically seeds an initial habit memory bank and links your current profile.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !groupName.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Creating Group...' : 'Create Household'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ADD ROOMMATE */}
        {activeTab === 'add_member' && (
          <form onSubmit={handleAddMember} className="space-y-4 text-xs font-sans">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-300 font-mono text-[11px]">
              Adding roommate to: <span className="font-bold">{currentHousehold?.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Roommate Full Name</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Karan Malhotra"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="karan@example.com"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-300 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>UPI Payee VPA Handle</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400">Zero-Custody Settlements</span>
              </label>
              <input
                type="text"
                required
                value={memberUpi}
                onChange={(e) => setMemberUpi(e.target.value)}
                placeholder="karan@okaxis"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-purple-400" />
                  <span>Room Area (Sq Ft)</span>
                </label>
                <input
                  type="number"
                  value={memberSqFt}
                  onChange={(e) => setMemberSqFt(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-medium">Custom Split %</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={memberCustomPct ?? ''}
                  onChange={(e) => setMemberCustomPct(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !memberName.trim() || !memberEmail.trim() || !memberUpi.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Adding Roommate...' : 'Add Roommate'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: MEMBERS LIST */}
        {activeTab === 'members_list' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-400 font-sans">
              Roommates in <span className="text-cyan-300 font-semibold">{currentHousehold?.name}</span>:
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {currentHousehold?.roommates?.length === 0 ? (
                <div className="p-6 bg-slate-950/40 rounded-xl text-center text-xs text-gray-500 font-mono">
                  No roommates registered yet. Click "Add Roommate" above to invite flatmates!
                </div>
              ) : (
                currentHousehold?.roommates?.map((rm) => (
                  <div
                    key={rm.id}
                    className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {rm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{rm.name}</span>
                          {rm.habit_badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded">
                              {rm.habit_badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-cyan-400">{rm.upi_vpa}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                      <span>{rm.room_sq_ft} sq ft</span>
                      <button
                        onClick={() => handleRemoveMember(rm.id, rm.name)}
                        title="Remove member"
                        className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
