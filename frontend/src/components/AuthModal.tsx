'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Smartphone, QrCode, Sparkles, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (tab === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          upi_vpa: upiVpa.trim() || undefined,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-md bg-[#fcfaf5] border-2 border-[#1a3300] p-6 md:p-8 space-y-6 shadow-[0_20px_40px_-10px_rgba(26,51,0,0.2)] rounded-[16px] animate-pop-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#b6b6b6] pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#1a3300] flex items-center gap-2">
              <span>{tab === 'login' ? 'Sign In to RoomieOps' : 'Join RoomieOps AI'}</span>
            </h3>
            <p className="text-xs text-[#1a3300]/70 font-sans mt-0.5">
              {tab === 'login'
                ? 'Authenticate with your roommate account'
                : 'Create a new roommate profile with instant settlement support'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#1a3300]/60 hover:text-[#1a3300] rounded-[6px] hover:bg-[#e8e4d9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-[#e8e4d9]/50 rounded-[8px] border border-[#b6b6b6]">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-[6px] transition-transform active:scale-[0.97] flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-[#1a3300] text-[#fcfaf5] shadow-sm'
                : 'text-[#1a3300] hover:bg-[#fcfaf5]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-[6px] transition-transform active:scale-[0.97] flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-[#1a3300] text-[#fcfaf5] shadow-sm'
                : 'text-[#1a3300] hover:bg-[#fcfaf5]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-[#cb5521] border border-[#1a3300] text-[#fcfaf5] rounded-[6px] text-xs font-mono flex items-center gap-2">
            <X className="w-4 h-4 text-[#fcfaf5] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {tab === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#1a3300]" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none transition-colors"
                placeholder="e.g. Maya Patel"
              />
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#1a3300]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none transition-colors"
              placeholder="e.g. maya@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1a3300]" />
              <span>Password</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] placeholder-[#1a3300]/40 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {tab === 'register' && (
            <>
              {/* UPI VPA */}
              <div className="space-y-1.5">
                <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-[#1a3300]" />
                  <span>UPI VPA Handle</span>
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] font-mono placeholder-[#1a3300]/40 focus:outline-none transition-colors"
                  placeholder="e.g. maya@okaxis"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[#1a3300] font-semibold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#1a3300]" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#fcfaf5] border border-[#b6b6b6] focus:border-[#1a3300] rounded-[6px] px-3.5 py-2.5 text-[#1a3300] font-mono placeholder-[#1a3300]/40 focus:outline-none transition-colors"
                  placeholder="+91 98765 00000"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#1a3300] hover:bg-[#1a3300]/90 text-[#fcfaf5] font-semibold rounded-[6px] shadow-sm transition-transform active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{tab === 'login' ? 'Sign In to Dashboard' : 'Create Roommate Account'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
