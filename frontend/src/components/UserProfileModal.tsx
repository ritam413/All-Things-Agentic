'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, X, Check, Shield, Smartphone, QrCode, Mail, Hash, Home, Sparkles } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setUpiVpa(currentUser.upi_vpa || '');
      setAvatarUrl(currentUser.avatar_url || '');
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        upi_vpa: upiVpa.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });
      setSuccessMsg('Profile and UPI handle successfully updated!');
      setTimeout(() => {
        setSuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card border border-cyan-500/30 p-6 md:p-8 space-y-6 shadow-2xl bg-[#0d1322]/95 rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <span>Roommate Profile</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Live Sync
                </span>
              </h3>
              <p className="text-xs font-mono text-gray-400">Manage identity, phone & direct settlement handle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono flex items-center gap-2 animate-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-mono flex items-center gap-2">
            <X className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          {/* User ID & Email Badge */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <Hash className="w-3 h-3 text-cyan-500" /> User ID
              </span>
              <div className="text-xs font-mono text-gray-300 truncate">{currentUser.id}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                <Mail className="w-3 h-3 text-purple-400" /> Email
              </span>
              <div className="text-xs font-mono text-gray-300 truncate">{currentUser.email}</div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-medium flex items-center gap-1.5">
              <span>Display Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              placeholder="e.g. Alex Chen"
            />
          </div>

          {/* UPI VPA Handle */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-medium flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-brand-cyan" />
                <span>UPI Payee VPA Handle</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">Zero-Custody Instant Settlements</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-24"
                placeholder="e.g. yourname@okaxis"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded font-mono text-[10px]">
                upi://pay
              </div>
            </div>
            <p className="text-[11px] text-gray-500">
              Debtors generate zero-custody QR codes and deep links pointing directly to this VPA.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-gray-300 font-medium flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Phone / WhatsApp Number</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Household Memberships */}
          <div className="space-y-1.5 pt-2">
            <label className="text-gray-400 font-medium text-[11px] flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span>Household Memberships ({currentUser.household_ids?.length || 0})</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.household_ids && currentUser.household_ids.length > 0 ? (
                currentUser.household_ids.map((hhId) => (
                  <span
                    key={hhId}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-gray-300 font-mono text-[11px] rounded-lg"
                  >
                    {hhId}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-[11px] font-mono">No linked households</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-gray-300 rounded-xl transition-colors font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
