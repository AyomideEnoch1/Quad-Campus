import React, { useState } from 'react';
import { ShieldCheck, Mail, CheckCircle2, X } from 'lucide-react';

export default function EduVerificationModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onVerifySuccess 
}) {
  const [emailInput, setEmailInput] = useState(currentUser.email || '');
  const [step, setStep] = useState('input'); // 'input' | 'sent' | 'success'

  if (!isOpen) return null;

  const handleSendLink = (e) => {
    e.preventDefault();
    if (!emailInput.includes('.edu')) {
      alert('Please enter a valid school email address ending in .edu');
      return;
    }
    setStep('sent');
  };

  const handleSimulateVerification = () => {
    setStep('success');
    setTimeout(() => {
      onVerifySuccess();
      onClose();
      setStep('input');
    }, 1500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 110,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div className="animate-slide-up" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '14px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={32} color="#10B981" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Verify Student Status</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Connect your official <strong>.edu</strong> email address to earn the verified student badge and build trust for marketplace sales.
        </p>

        {step === 'input' && (
          <form onSubmit={handleSendLink} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email"
                placeholder="yourname@harvard.edu"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input-styled"
                style={{ paddingLeft: '36px' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Send Verification Code 📧
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
              Verification link sent to <strong>{emailInput}</strong>
            </div>

            <button onClick={handleSimulateVerification} className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #10B981, #059669)' }}>
              Simulate Clicking Email Verification Link ⚡
            </button>
          </div>
        )}

        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={40} color="#10B981" />
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#10B981' }}>
              Verification Complete!
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
