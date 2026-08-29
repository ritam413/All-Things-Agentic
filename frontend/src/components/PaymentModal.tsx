'use client';

import React, { useState } from 'react';
import { X, QrCode, ExternalLink, CheckCircle2 } from 'lucide-react';
import { SplitShare, Settlement, DEFAULT_HOUSEHOLD_ID } from '../../../shared/types';
import { confirmPayment, confirmDebtSettlement } from '../services/api';
import { toast } from 'sonner';

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
    const toastId = toast.loading('Verifying payment with autonomous ledger...');
    try {
      if (settlement) {
        await confirmDebtSettlement({
          household_id: DEFAULT_HOUSEHOLD_ID,
          from_roommate_id: settlement.from_roommate_id,
          to_roommate_id: settlement.to_roommate_id,
          amount: settlement.amount,
        });
        toast.success(`Settlement of ₹${amount.toFixed(2)} confirmed!`, {
          id: toastId,
          description: `${settlement.from_roommate_name} to ${settlement.to_roommate_name} cleared.`,
        });
      } else if (share) {
        await confirmPayment(share.id);
        toast.success(`Payment of ₹${amount.toFixed(2)} confirmed!`, {
          id: toastId,
          description: `Split share for ${share.roommate_name} marked as PAID.`,
        });
      }
      onPaymentSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to confirm payment.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a3300]/40 backdrop-blur-sm transition-opacity duration-200">
      <div className="bg-[#fcfaf5] border-2 border-[#1a3300] rounded-[16px] max-w-sm w-full p-6 space-y-5 relative animate-pop-in shadow-[0_20px_40px_-10px_rgba(26,51,0,0.2)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1a3300]/60 hover:text-[#1a3300] p-1 rounded-[6px] hover:bg-[#e8e4d9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex p-2 bg-[#ffe95c] border border-[#1a3300] rounded-[8px] text-[#1a3300] mb-1">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#1a3300]">{title}</h3>
          <p className="text-xs text-[#1a3300]/70 font-sans">Scan QR on GPay/PhonePe or tap direct link on mobile.</p>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#fcfaf5] rounded-[8px] border border-[#b6b6b6]">
          {qrCode ? (
            <img
              src={qrCode}
              alt="UPI QR Code"
              className="w-44 h-44 rounded-[6px] border border-[#1a3300] p-1 bg-white"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-[#1a3300]/60 font-mono">
              [QR Loading...]
            </div>
          )}
          <div className="text-center mt-3">
            <div className="text-xs text-[#1a3300]/70">Total Amount Due:</div>
            <div className="text-2xl font-mono font-extrabold text-[#1a3300] tracking-tight">
              ₹{amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={upiLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-[#1a3300] hover:bg-[#1a3300]/90 text-[#fcfaf5] font-semibold rounded-[6px] text-xs font-mono flex items-center justify-center gap-2 transition-transform active:scale-[0.97] shadow-sm"
          >
            <span>Open in UPI App (GPay/PhonePe)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#d5f5c2] hover:bg-[#c3ecad] text-[#1a3300] font-mono text-xs rounded-[6px] border border-[#1a3300] font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.97] disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{submitting ? 'Confirming...' : "I've Paid — Confirm Webhook"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
