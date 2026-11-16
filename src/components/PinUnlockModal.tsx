import React, { useState } from 'react';
import { Lock, X, AlertCircle } from 'lucide-react';

interface PinUnlockModalProps {
  isOpen: boolean;
  actionLabel: string;
  onClose: () => void;
  onVerified: () => void;
}

export const PinUnlockModal: React.FC<PinUnlockModalProps> = ({
  isOpen,
  actionLabel,
  onClose,
  onVerified,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Masukkan PIN Admin terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'PIN Admin tidak sesuai.');
        return;
      }
      setPin('');
      onVerified();
    } catch {
      setError('Gagal terhubung ke server verifikasi PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-modal-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 id="pin-modal-title" className="font-display text-lg font-bold text-slate-900">
                Verifikasi PIN Administrator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesi ujian aktif terkunci
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPin('');
              setError('');
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Paket soal sudah digenerate. Untuk <strong>{actionLabel}</strong>, masukkan PIN Admin yang telah ditetapkan pada Konfigurasi Administrator.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="admin-unlock-pin" className="block text-sm font-medium text-slate-700">
              PIN Keamanan Admin
            </label>
            <input
              id="admin-unlock-pin"
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masukkan PIN Admin"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-base tracking-widest text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError('');
                onClose();
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Memeriksa...' : 'Buka Kunci & Lanjutkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
