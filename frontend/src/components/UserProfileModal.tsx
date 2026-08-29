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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-lg bg-[#fcfaf5] border-2 border-[#1a3300] p-6 md:p-8 space-y-6 shadow-[0_20px_40px_-10px_rgba(26,51,0,0.2)] rounded-[16px] animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#b6b6b6] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#ffe95c] border border-[#1a3300] flex items-center justify-center text-[#1a3300] font-bold text-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a3300] flex items-center gap-2">
                <span>Roommate Profile</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#d5f5c2] text-[#1a3300] border border-[#1a3300] rounded-full">
                  Live Sync
                </span>
              </h3>
              <p className="text-xs text-[#1a3300]/70 font-sans">Manage identity, phone & direct settlement handle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1a3300]/60 hover:text-[#1a3300] rounded-[6px] hover:bg-[#e8e4d9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="p-3 bg-[#d5f5c2] border border-[#1a3300] text-[#1a3300] rounded-[6px] text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-[#1a3300]" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-[#cb5521] border border-[#1a3300] text-[#fcfaf5] rounded-[6px] text-xs font-mono flex items-center gap-2">
            <X className="w-4 h-4 text-[#fcfaf5]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
          {/* User ID & Email Badge */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#fcfaf5] rounded-[6px] border border-[#b6b6b6]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#1a3300]/60 flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#1a3300]" /> User ID
              </span>
              <div className="text-xs font-mono text-[#1a3300] font-semibold truncate">{currentUser.id}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-[#1a3300]/60 flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#1a3300]" /> Email
              </span>
              <div className="text-xs font-mono text-[#1a3300] font-semibold truncate">{currentUser.email}</div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
              <span>Display Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none transition-colors"
              placeholder="e.g. Alex Chen"
            />
          </div>

          {/* UPI VPA Handle */}
          <div className="space-y-1.5">
            <label className="text-[#1a3300] font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#1a3300]" />
                <span>UPI Payee VPA Handle</span>
              </span>
              <span className="text-[10px] font-mono text-[#1a3300]/70">Zero-Custody Settlements</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] font-mono placeholder-[#1a3300]/40 focus:outline-none transition-colors pr-24"
                placeholder="e.g. yourname@okaxis"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-[#ffe95c] border border-[#1a3300] text-[#1a3300] rounded font-mono text-[10px] font-bold">
                upi://pay
              </div>
            </div>
            <p className="text-[11px] text-[#1a3300]/60">
              Debtors generate zero-custody QR codes and deep links pointing directly to this VPA.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#1a3300]" />
              <span>Phone / WhatsApp Number</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] font-mono placeholder-[#1a3300]/40 focus:outline-none transition-colors"
              placeholder="+91 98765 43210"
            />
          </div>

          {/* Household Memberships */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[#1a3300]/70 font-semibold text-[11px] flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#1a3300]" />
              <span>Household Memberships ({currentUser.household_ids?.length || 0})</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.household_ids && currentUser.household_ids.length > 0 ? (
                currentUser.household_ids.map((hhId) => (
                  <span
                    key={hhId}
                    className="px-2.5 py-1 bg-[#d5f5c2] border border-[#1a3300] text-[#1a3300] font-mono text-[11px] rounded-[4px]"
                  >
                    {hhId}
                  </span>
                ))
              ) : (
                <span className="text-[#1a3300]/60 text-[11px] font-mono">No linked households</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#b6b6b6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#fcfaf5] hover:bg-[#e8e4d9] text-[#1a3300] border border-[#b6b6b6] rounded-[6px] transition-transform active:scale-[0.97] font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#1a3300] hover:bg-[#1a3300]/90 text-[#fcfaf5] font-semibold rounded-[6px] transition-transform active:scale-[0.97] flex items-center gap-2 disabled:opacity-50 text-xs shadow-sm"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
