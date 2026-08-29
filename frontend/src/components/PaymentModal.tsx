'use client';

import React, { useState } from 'react';
import { X, QrCode, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SplitShare, Settlement, DEFAULT_HOUSEHOLD_ID } from '../../../shared/types';
import { confirmPayment, confirmDebtSettlement } from '../services/api';

interface Props {
  share?: SplitShare | null;
  settlement?: Settlement | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<Props> = ({ share, settlement, isOpen, onClose, onPaymentSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || (!share && !settlement)) return null;

  const upiLink = share ? share.upi_deep_link : settlement?.upi_deep_link || '';
  const qrCode = share ? share.qr_code_base64 : settlement?.qr_code_base64 || '';
  const amount = share ? share.amount_owed : settlement?.amount || 0;
  const title = settlement
    ? `Settlement: ${settlement.from_roommate_name} ➔ ${settlement.to_roommate_name}`
    : 'One-Tap UPI Payment';

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      if (settlement) {
        await confirmDebtSettlement({
          household_id: DEFAULT_HOUSEHOLD_ID,
          from_roommate_id: settlement.from_roommate_id,
          to_roommate_id: settlement.to_roommate_id,
          amount: settlement.amount,
        });
      } else if (share) {
        await confirmPayment(share.id);
      }
      onPaymentSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-card-glow max-w-sm w-full p-6 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex p-2 bg-cyan-500/10 rounded-full text-cyan-400 mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-heading font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-400">Scan QR on GPay/PhonePe or tap direct link on mobile.</p>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800">
          {qrCode ? (
            <img
              src={qrCode}
              alt="UPI QR Code"
              className="w-44 h-44 rounded-lg border border-cyan-500/20"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-gray-500 font-mono">
              [QR Loading...]
            </div>
          )}
          <div className="text-center mt-3">
            <div className="text-xs text-gray-400">Total Amount Due:</div>
            <div className="text-xl font-heading font-extrabold text-emerald-400">
              ₹{amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href={upiLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <span>Open in UPI App (GPay/PhonePe)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{submitting ? 'Confirming...' : "I've Paid — Confirm Webhook"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
