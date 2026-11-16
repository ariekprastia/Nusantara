import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  KeyRound,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  JENJANG_CLASSES,
  LEARNING_METHODS,
  SUBJECTS_BY_JENJANG,
} from '../data/curriculum.ts';
import {
  getCachedAccessToken,
  initGoogleAuth,
  signInWithGoogleWorkspace,
  signOutGoogleWorkspace,
} from '../services/googleAuth.ts';
import {
  createExamSpreadsheet,
  pullBankFromSpreadsheet,
  syncBankToSpreadsheet,
  syncResultsToSpreadsheet,
} from '../services/googleSheets.ts';
import type {
  AdminConfig,
  ConcreteDifficulty,
  ExamResult,
  Jenjang,
  Kurikulum,
  QuestionItem,
} from '../types/exam.ts';
import { generateGasCodeGs, generateGasIndexHtml } from '../utils/gasTemplate.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface AdminDashboardProps {
  onConfigUpdated: () => void;
  onExitAdmin: () => void;
}

type AdminTab = 'config' | 'bank' | 'results' | 'sheets';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onConfigUpdated,
  onExitAdmin,
}) => {
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authenticatedPassword, setAuthenticatedPassword] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  const [loadingData, setLoadingData] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );

  // Admin state
  const [config, setConfig] = useState<AdminConfig>({
    adminPassword: 'admin123',
    unlockPin: '1234',
    defaultKkm: 75,
    defaultDurationMinutes: 30,
    spreadsheetId: '',
    schoolTitle: 'Nusantara CBT',
  });
  const [bank, setBank] = useState<QuestionItem[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  // Bank filter & creation state
  const [bankSearch, setBankSearch] = useState('');
  const [bankJenjangFilter, setBankJenjangFilter] = useState<'ALL' | Jenjang>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQJenjang, setNewQJenjang] = useState<Jenjang>('SMP');
  const [newQKurikulum, setNewQKurikulum] = useState<Kurikulum>('Kurikulum Merdeka');
  const [newQMapel, setNewQMapel] = useState(SUBJECTS_BY_JENJANG.SMP[3].name);
  const [newQDifficulty, setNewQDifficulty] = useState<ConcreteDifficulty>('sedang');
  const [newQTopic, setNewQTopic] = useState('');
  const [newQPrompt, setNewQPrompt] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrectIdx, setNewQCorrectIdx] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQImageUrl, setNewQImageUrl] = useState('');

  // Results search
  const [resultSearch, setResultSearch] = useState('');

  // Google Sheets OAuth state
  const [needsGoogleAuth, setNeedsGoogleAuth] = useState(true);
  const [googleToken, setGoogleToken] = useState<string | null>(getCachedAccessToken());
  const [googleEmail, setGoogleEmail] = useState<string>('');
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [sheetsBusy, setSheetsBusy] = useState(false);

  // GAS viewer tab
  const [gasTab, setGasTab] = useState<'code' | 'html'>('code');

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    tone?: 'primary' | 'danger';
    action: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const unsub = initGoogleAuth(
      (user, token) => {
        setGoogleToken(token);
        setGoogleEmail(user.email || user.displayName || 'Akun Google Terhubung');
        setNeedsGoogleAuth(false);
      },
      () => {
        setGoogleToken(null);
        setGoogleEmail('');
        setNeedsGoogleAuth(true);
      }
    );
    return () => unsub();
  }, []);

  const fetchAdminData = async (pwd: string) => {
    setLoadingData(true);
    try {
      const headers = { 'x-admin-password': pwd };
      const [cfgRes, bankRes, resRes] = await Promise.all([
        fetch('/api/admin/config', { headers }),
        fetch('/api/bank', { headers }),
        fetch('/api/results', { headers }),
      ]);
      if (cfgRes.ok) {
        const cfgJson = (await cfgRes.json()) as { config: AdminConfig };
        setConfig(cfgJson.config);
      }
      if (bankRes.ok) {
        const bankJson = (await bankRes.json()) as { bank: QuestionItem[] };
        setBank(bankJson.bank);
      }
      if (resRes.ok) {
        const resJson = (await resRes.json()) as { results: ExamResult[] };
        setResults(resJson.results);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      setLoginError('Password Administrator wajib diisi.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPasswordInput }),
      });
      if (!res.ok) {
        setLoginError('Password Administrator tidak sesuai.');
        return;
      }
      setAuthenticatedPassword(adminPasswordInput);
      await fetchAdminData(adminPasswordInput);
    } catch {
      setLoginError('Gagal terhubung ke server autentikasi.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedPassword) return;
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': authenticatedPassword,
        },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as { ok?: boolean; config?: AdminConfig; error?: string };
      if (!res.ok || !data.ok) {
        setFeedback({ type: 'err', text: data.error || 'Gagal menyimpan konfigurasi.' });
        return;
      }
      if (data.config) {
        setConfig(data.config);
        setAuthenticatedPassword(data.config.adminPassword);
      }
      onConfigUpdated();
      setFeedback({
        type: 'ok',
        text: 'Konfigurasi Password Admin, PIN Buka Kunci, dan pengaturan ujian berhasil disimpan.',
      });
    } catch {
      setFeedback({ type: 'err', text: 'Terjadi kesalahan saat menyimpan konfigurasi.' });
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedPassword) return;
    if (!newQPrompt.trim() || newQOptions.some((o) => !o.trim())) {
      setFeedback({ type: 'err', text: 'Teks soal dan seluruh pilihan jawaban wajib diisi.' });
      return;
    }
    const payload: Partial<QuestionItem> = {
      jenjang: newQJenjang,
      kelas: JENJANG_CLASSES[newQJenjang][0].label,
      kurikulum: newQKurikulum,
      mapel: newQMapel,
      difficulty: newQDifficulty,
      learningMethod: LEARNING_METHODS[0].name,
      topic: newQTopic.trim() || newQMapel,
      prompt: newQPrompt.trim(),
      options: newQOptions.map((o) => o.trim()),
      correctIndex: newQCorrectIdx,
      explanation:
        newQExplanation.trim() || 'Pelajari kembali kompetensi dasar materi ini.',
      hasImage: Boolean(newQImageUrl.trim()),
      imageUrl: newQImageUrl.trim() || undefined,
      source: 'bank',
    };

    const res = await fetch('/api/bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': authenticatedPassword,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNewQTopic('');
      setNewQPrompt('');
      setNewQOptions(['', '', '', '']);
      setNewQExplanation('');
      setNewQImageUrl('');
      setShowAddForm(false);
      await fetchAdminData(authenticatedPassword);
      setFeedback({ type: 'ok', text: 'Soal baru berhasil ditambahkan ke Bank Soal.' });
    }
  };

  const handleDeleteBankItem = (item: QuestionItem) => {
    if (!authenticatedPassword) return;
    setConfirmState({
      open: true,
      title: 'Hapus Soal dari Bank?',
      description: `Apakah Anda yakin ingin menghapus soal topik "${item.topic}" (${item.jenjang} · ${item.mapel}) secara permanen?`,
      confirmLabel: 'Hapus Soal',
      tone: 'danger',
      action: async () => {
        await fetch(`/api/bank/${encodeURIComponent(item.id)}`, {
          method: 'DELETE',
          headers: { 'x-admin-password': authenticatedPassword },
        });
        await fetchAdminData(authenticatedPassword);
        setFeedback({ type: 'ok', text: 'Soal berhasil dihapus dari Bank Soal.' });
      },
    });
  };

  const handleExportCsv = () => {
    const header = [
      'Timestamp',
      'Nama Peserta Didik',
      'Kelas',
      'Sekolah',
      'Jenjang',
      'Kurikulum',
      'Mata Pelajaran',
      'Metode Belajar',
      'Kesulitan',
      'Mode',
      'Skor',
      'Benar',
      'Total Soal',
    ];
    const rows = results.map((r) => [
      r.timestamp,
      r.studentName,
      r.studentClass,
      r.schoolName || '-',
      r.jenjang,
      r.kurikulum,
      r.mapel,
      r.learningMethod,
      r.difficulty,
      r.mode,
      String(r.score),
      String(r.correctCount),
      String(r.totalQuestions),
    ]);
    const csvContent =
      [header, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
        .join('\n') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-ujian-cbt-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportBankJson = () => {
    const blob = new Blob([JSON.stringify(bank, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-soal-nusantara-cbt-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBankFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authenticatedPassword) return;
    setFeedback(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) {
        setFeedback({ type: 'err', text: 'File JSON harus berisi array daftar soal.' });
        return;
      }
      const res = await fetch('/api/bank/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': authenticatedPassword,
        },
        body: JSON.stringify({ items: parsed }),
      });
      const out = (await res.json()) as { added?: number; total?: number };
      await fetchAdminData(authenticatedPassword);
      setFeedback({
        type: 'ok',
        text: `Impor JSON selesai: ${out.added ?? 0} soal baru ditambahkan (Total Bank: ${out.total ?? bank.length}).`,
      });
    } catch {
      setFeedback({ type: 'err', text: 'Gagal membaca file JSON Bank Soal.' });
    } finally {
      e.target.value = '';
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoggingIn(true);
    setFeedback(null);
    try {
      const res = await signInWithGoogleWorkspace();
      setGoogleToken(res.accessToken);
      setGoogleEmail(res.user.email || res.user.displayName || 'Akun Google Terhubung');
      setNeedsGoogleAuth(false);
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal masuk dengan Google.',
      });
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!googleToken || !authenticatedPassword) {
      setNeedsGoogleAuth(true);
      return;
    }
    setSheetsBusy(true);
    setFeedback(null);
    try {
      const created = await createExamSpreadsheet(
        googleToken,
        `${config.schoolTitle || 'Nusantara CBT'} - Database Ujian`
      );
      const nextConfig = { ...config, spreadsheetId: created.spreadsheetId };
      setConfig(nextConfig);
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': authenticatedPassword,
        },
        body: JSON.stringify(nextConfig),
      });
      onConfigUpdated();
      setFeedback({
        type: 'ok',
        text: `Spreadsheet baru berhasil dibuat dengan ID: ${created.spreadsheetId}`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal membuat Google Spreadsheet.',
      });
    } finally {
      setSheetsBusy(false);
    }
  };

  const requestPushResultsToSheets = () => {
    if (!googleToken) {
      setNeedsGoogleAuth(true);
      return;
    }
    if (!config.spreadsheetId.trim()) {
      setFeedback({
        type: 'err',
        text: 'Masukkan Spreadsheet ID terlebih dahulu atau klik Buat Spreadsheet Baru.',
      });
      return;
    }
    setConfirmState({
      open: true,
      title: 'Sinkronkan Hasil Ujian ke Google Sheets?',
      description: `Aksi ini akan menulis ulang isi tab "Hasil_Ujian" pada Spreadsheet ID (${config.spreadsheetId}) dengan ${results.length} baris rekap nilai saat ini.`,
      confirmLabel: 'Ya, Sinkronkan Sekarang',
      action: async () => {
        setSheetsBusy(true);
        try {
          const out = await syncResultsToSpreadsheet(
            googleToken,
            config.spreadsheetId.trim(),
            results
          );
          setFeedback({
            type: 'ok',
            text: `Berhasil menyinkronkan ${out.syncedRows} baris hasil ujian ke tab Hasil_Ujian.`,
          });
        } finally {
          setSheetsBusy(false);
        }
      },
    });
  };

  const requestPushBankToSheets = () => {
    if (!googleToken) {
      setNeedsGoogleAuth(true);
      return;
    }
    if (!config.spreadsheetId.trim()) {
      setFeedback({
        type: 'err',
        text: 'Masukkan Spreadsheet ID terlebih dahulu atau klik Buat Spreadsheet Baru.',
      });
      return;
    }
    setConfirmState({
      open: true,
      title: 'Sinkronkan Bank Soal & Konfigurasi ke Google Sheets?',
      description: `Aksi ini akan memperbarui tab "Bank_Soal" (${bank.length} soal) dan "Konfigurasi_Admin" pada Spreadsheet ID (${config.spreadsheetId}).`,
      confirmLabel: 'Ya, Perbarui Sheets',
      action: async () => {
        setSheetsBusy(true);
        try {
          const out = await syncBankToSpreadsheet(
            googleToken,
            config.spreadsheetId.trim(),
            bank,
            config
          );
          setFeedback({
            type: 'ok',
            text: `Berhasil menyinkronkan ${out.syncedQuestions} soal dan konfigurasi admin ke Google Sheets.`,
          });
        } finally {
          setSheetsBusy(false);
        }
      },
    });
  };

  const handlePullBankFromSheets = async () => {
    if (!googleToken || !authenticatedPassword) {
      setNeedsGoogleAuth(true);
      return;
    }
    if (!config.spreadsheetId.trim()) {
      setFeedback({ type: 'err', text: 'Masukkan Spreadsheet ID yang valid.' });
      return;
    }
    setSheetsBusy(true);
    setFeedback(null);
    try {
      const imported = await pullBankFromSpreadsheet(
        googleToken,
        config.spreadsheetId.trim()
      );
      if (imported.length === 0) {
        setFeedback({
          type: 'err',
          text: 'Tidak ditemukan data soal pada tab Bank_Soal di Spreadsheet tersebut.',
        });
        return;
      }
      const res = await fetch('/api/bank/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': authenticatedPassword,
        },
        body: JSON.stringify({ items: imported }),
      });
      const json = (await res.json()) as { added?: number; total?: number };
      await fetchAdminData(authenticatedPassword);
      setFeedback({
        type: 'ok',
        text: `Impor dari Google Sheets selesai: ${imported.length} soal diproses (${json.added ?? 0} soal baru ditambahkan).`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal membaca soal dari Google Sheets.',
      });
    } finally {
      setSheetsBusy(false);
    }
  };

  const gasCodeText =
    gasTab === 'code'
      ? generateGasCodeGs(config.spreadsheetId)
      : generateGasIndexHtml();

  const handleCopyGas = async () => {
    await navigator.clipboard.writeText(gasCodeText);
    setFeedback({
      type: 'ok',
      text: `Kode ${gasTab === 'code' ? 'Code.gs' : 'Index.html'} berhasil disalin ke clipboard.`,
    });
  };

  const handleDownloadGas = () => {
    const filename = gasTab === 'code' ? 'Code.gs' : 'Index.html';
    const blob = new Blob([gasCodeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Password Login Gate
  if (!authenticatedPassword) {
    return (
      <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-slate-900">
            Masuk Dashboard Administrator
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Kelola konfigurasi keamanan PIN, password admin, bank soal kurikulum, rekap nilai, dan sinkronisasi Google Sheets.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-password-login"
                className="block text-sm font-semibold text-slate-800"
              >
                Password Administrator
              </label>
              <input
                id="admin-password-login"
                type="password"
                autoFocus
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  if (loginError) setLoginError('');
                }}
                placeholder="Masukkan password administrator"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/15"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              Kredensial awal bawaan sistem: Password <code className="font-mono font-bold text-slate-900">admin123</code> · PIN Buka Kunci <code className="font-mono font-bold text-slate-900">1234</code> (dapat langsung diubah setelah masuk).
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onExitAdmin}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={loginLoading}
                className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 cursor-pointer"
              >
                {loginLoading ? 'Memverifikasi...' : 'Buka Dashboard'}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  const filteredBank = bank.filter((q) => {
    const matchJenjang = bankJenjangFilter === 'ALL' || q.jenjang === bankJenjangFilter;
    const term = bankSearch.trim().toLowerCase();
    const matchSearch =
      !term ||
      q.mapel.toLowerCase().includes(term) ||
      q.topic.toLowerCase().includes(term) ||
      q.prompt.toLowerCase().includes(term);
    return matchJenjang && matchSearch;
  });

  const filteredResults = results.filter((r) => {
    const term = resultSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      r.studentName.toLowerCase().includes(term) ||
      r.mapel.toLowerCase().includes(term) ||
      r.jenjang.toLowerCase().includes(term)
    );
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Dashboard Administrator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pengaturan PIN keamanan, Bank Soal, Rekap Nilai, dan Sinkronisasi Google Sheets / GAS.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchAdminData(authenticatedPassword)}
            disabled={loadingData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Muat Ulang</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthenticatedPassword(null);
              setAdminPasswordInput('');
              onExitAdmin();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'config', label: 'Konfigurasi Keamanan & Ujian' },
            { id: 'bank', label: `Bank Soal (${bank.length})` },
            { id: 'results', label: `Rekap Nilai (${results.length})` },
            { id: 'sheets', label: 'Google Sheets & Apps Script' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setActiveTab(t.id);
              setFeedback(null);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div
          className={`mt-5 flex items-center gap-2.5 rounded-xl border p-3.5 text-sm ${
            feedback.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {feedback.type === 'ok' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* TAB 1: CONFIG */}
      {activeTab === 'config' && (
        <form
          onSubmit={handleSaveConfig}
          className="mt-6 grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-white p-6 lg:grid-cols-2"
        >
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Keamanan PIN &amp; Password Administrator
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              PIN digunakan saat membuka kunci sesi ujian yang sudah digenerate.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Password Dashboard Administrator
                </label>
                <input
                  type="text"
                  value={config.adminPassword}
                  onChange={(e) => setConfig({ ...config, adminPassword: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  PIN Admin (Buka Kunci Beranda &amp; Generate Soal Baru)
                </label>
                <input
                  type="text"
                  value={config.unlockPin}
                  onChange={(e) => setConfig({ ...config, unlockPin: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm tracking-widest text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Identitas Portal &amp; Standar Penilaian
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Mengatur judul sekolah, batas ketuntasan minimal (KKM), dan durasi default.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Nama Portal / Sekolah
                </label>
                <input
                  type="text"
                  value={config.schoolTitle}
                  onChange={(e) => setConfig({ ...config, schoolTitle: e.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    KKM Default (0–100)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={config.defaultKkm}
                    onChange={(e) =>
                      setConfig({ ...config, defaultKkm: Number(e.target.value) || 75 })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 focus:border-blue-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Timer Default (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={config.defaultDurationMinutes}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        defaultDurationMinutes: Number(e.target.value) || 30,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: BANK SOAL */}
      {activeTab === 'bank' && (
        <section className="mt-6 space-y-5">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Cari mapel, topik, soal..."
                  className="rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
                />
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {(['ALL', 'SD', 'SMP', 'SMA'] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setBankJenjangFilter(j)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold cursor-pointer ${
                      bankJenjangFilter === j
                        ? 'bg-white text-blue-900 shadow-sm'
                        : 'text-slate-600'
                    }`}
                  >
                    {j === 'ALL' ? 'Semua' : j}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={handleExportBankJson}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Ekspor JSON</span>
              </button>
              <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>Impor JSON</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportBankFile}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{showAddForm ? 'Tutup Form' : 'Tambah Soal Baru'}</span>
              </button>
            </div>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleAddQuestion}
              className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <h3 className="font-display text-base font-bold text-slate-900">
                Tambah Butir Soal ke Bank Kurikulum
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Jenjang</label>
                  <select
                    value={newQJenjang}
                    onChange={(e) => {
                      const j = e.target.value as Jenjang;
                      setNewQJenjang(j);
                      setNewQMapel(SUBJECTS_BY_JENJANG[j][0].name);
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Kurikulum</label>
                  <select
                    value={newQKurikulum}
                    onChange={(e) => setNewQKurikulum(e.target.value as Kurikulum)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                    <option value="Kurikulum 2013">Kurikulum 2013</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Mata Pelajaran
                  </label>
                  <select
                    value={newQMapel}
                    onChange={(e) => setNewQMapel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {SUBJECTS_BY_JENJANG[newQJenjang].map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Kesulitan</label>
                  <select
                    value={newQDifficulty}
                    onChange={(e) => setNewQDifficulty(e.target.value as ConcreteDifficulty)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Topik Materi</label>
                  <input
                    type="text"
                    value={newQTopic}
                    onChange={(e) => setNewQTopic(e.target.value)}
                    placeholder="Contoh: Sistem Persamaan Linear"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Path Gambar Ilustrasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={newQImageUrl}
                    onChange={(e) => setNewQImageUrl(e.target.value)}
                    placeholder="/src/assets/images/illus_geometri_bangun_1794805202993.jpg"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Pertanyaan Soal
                </label>
                <textarea
                  rows={3}
                  value={newQPrompt}
                  onChange={(e) => setNewQPrompt(e.target.value)}
                  placeholder="Tuliskan teks soal lengkap..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {newQOptions.map((opt, idx) => (
                  <div key={idx}>
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Opsi {String.fromCharCode(65 + idx)}</span>
                      <span className="inline-flex items-center gap-1 font-normal">
                        <input
                          type="radio"
                          name="newq-correct"
                          checked={newQCorrectIdx === idx}
                          onChange={() => setNewQCorrectIdx(idx)}
                        />
                        Kunci Benar
                      </span>
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const copy = [...newQOptions];
                        copy[idx] = e.target.value;
                        setNewQOptions(copy);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Penjelasan &amp; Pembahasan Jawaban
                </label>
                <textarea
                  rows={2}
                  value={newQExplanation}
                  onChange={(e) => setNewQExplanation(e.target.value)}
                  placeholder="Jelaskan langkah penyelesaian atau alasan jawaban benar..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  Simpan ke Bank Soal
                </button>
              </div>
            </form>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {filteredBank.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Tidak ada soal yang cocok dengan filter pencarian.
                </div>
              ) : (
                filteredBank.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-900">{item.jenjang}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-800">{item.mapel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{item.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.hasImage ? 'Bergambar' : 'Teks'}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 line-clamp-2">
                        {item.prompt}
                      </p>
                      <p className="text-xs text-slate-500">Topik: {item.topic}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteBankItem(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer shrink-0 self-start"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 3: REKAP NILAI */}
      {activeTab === 'results' && (
        <section className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={resultSearch}
                onChange={(e) => setResultSearch(e.target.value)}
                placeholder="Cari nama peserta didik atau mapel..."
                className="w-full sm:w-72 rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={results.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer self-start"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Rekap CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Peserta Didik</th>
                  <th className="px-4 py-3">Jenjang / Mapel</th>
                  <th className="px-4 py-3">Metode Belajar</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Benar</th>
                  <th className="px-4 py-3 text-right">Nilai</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      Belum ada riwayat hasil ujian peserta didik yang terekam.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{r.studentName}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.studentClass} · {new Date(r.timestamp).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{r.mapel}</div>
                        <div className="text-[11px] text-slate-500">
                          {r.jenjang} · {r.kurikulum}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                        {r.learningMethod}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {r.mode === 'ujian' ? 'Simulasi Ujian' : 'Latihan Mandiri'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800">
                        {r.correctCount}/{r.totalQuestions}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold tabular-nums text-slate-900">
                        {r.score}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold ${
                            r.passed ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {r.passed ? 'Tuntas' : 'Penguatan'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: GOOGLE SHEETS & GAS */}
      {activeTab === 'sheets' && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Google Sheets Live Sync */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Sinkronisasi Langsung Google Sheets
              </h2>
            </div>

            <div className="mt-4">
              {needsGoogleAuth || !googleToken ? (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-slate-600">
                    Masuk dengan akun Google Anda untuk membuat atau menyinkronkan Spreadsheet database CBT (tab <code className="font-mono">Hasil_Ujian</code>, <code className="font-mono">Bank_Soal</code>, dan <code className="font-mono">Konfigurasi_Admin</code>).
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoggingIn}
                    className="gsi-material-button"
                  >
                    <div className="gsi-material-button-content-wrapper">
                      <div className="gsi-material-button-icon">
                        <svg
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          style={{ display: 'block' }}
                        >
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      </div>
                      <span>
                        {isGoogleLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}
                      </span>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs">
                    <div>
                      <div className="font-bold text-emerald-900">Google Terhubung</div>
                      <div className="text-emerald-800">{googleEmail}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOutGoogleWorkspace()}
                      className="rounded-md border border-emerald-300 bg-white px-2.5 py-1 font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                    >
                      Putuskan
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Google Spreadsheet ID
                    </label>
                    <input
                      type="text"
                      value={config.spreadsheetId}
                      onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                      placeholder="Tempel ID Spreadsheet atau buat baru di bawah"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={sheetsBusy}
                    onClick={handleCreateSpreadsheet}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 cursor-pointer"
                  >
                    <Database className="h-4 w-4" />
                    <span>Buat Spreadsheet CBT Baru Otomatis</span>
                  </button>

                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      disabled={sheetsBusy}
                      onClick={requestPushResultsToSheets}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-900 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 cursor-pointer"
                    >
                      <span>Push Rekap Nilai ke Tab Hasil_Ujian</span>
                    </button>

                    <button
                      type="button"
                      disabled={sheetsBusy}
                      onClick={requestPushBankToSheets}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-900 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 cursor-pointer"
                    >
                      <span>Push Bank Soal &amp; Config ke Sheets</span>
                    </button>

                    <button
                      type="button"
                      disabled={sheetsBusy}
                      onClick={handlePullBankFromSheets}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span>Tarik / Impor Soal dari Tab Bank_Soal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* GAS Template Generator */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Export Web App Google Apps Script (GAS)
                </h2>
                <p className="text-xs text-slate-500">
                  Kode siap tempel ke menu Ekstensi → Apps Script di Google Spreadsheet Anda.
                </p>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-1 self-start">
                <button
                  type="button"
                  onClick={() => setGasTab('code')}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold cursor-pointer ${
                    gasTab === 'code' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Code.gs
                </button>
                <button
                  type="button"
                  onClick={() => setGasTab('html')}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs font-semibold cursor-pointer ${
                    gasTab === 'html' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Index.html
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                Terhubung ke skema 3 tab: <code className="font-mono">Hasil_Ujian</code>,{' '}
                <code className="font-mono">Bank_Soal</code>,{' '}
                <code className="font-mono">Konfigurasi_Admin</code>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyGas}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadGas}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh {gasTab === 'code' ? 'Code.gs' : 'Index.html'}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-700">
              <div className="font-bold text-slate-900">
                Panduan Deploy Gratis Selamanya di Google Apps Script:
              </div>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                <li>Buka Google Sheets Anda, lalu klik menu <strong>Ekstensi → Apps Script</strong>.</li>
                <li>Tempel isi berkas <code className="font-mono font-semibold">Code.gs</code> dan buat file HTML baru bernama <code className="font-mono font-semibold">Index</code> lalu tempel isi <code className="font-mono font-semibold">Index.html</code>.</li>
                <li>Klik <strong>Terapkan (Deploy) → Deployment baru → Aplikasi web</strong> (akses: Siapa saja / Warga Sekolah).</li>
                <li>Salin URL Web App yang dihasilkan — aplikasi CBT berjalan 100% gratis di infrastruktur Google tanpa tagihan token atau server.</li>
              </ol>
            </div>

            <pre className="mt-3 max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
              <code>{gasCodeText}</code>
            </pre>
          </section>
        </div>
      )}

      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.open}
          title={confirmState.title}
          description={confirmState.description}
          confirmLabel={confirmState.confirmLabel}
          tone={confirmState.tone}
          loading={sheetsBusy}
          onCancel={() => setConfirmState(null)}
          onConfirm={async () => {
            try {
              await confirmState.action();
            } catch (err) {
              setFeedback({
                type: 'err',
                text: err instanceof Error ? err.message : 'Operasi gagal dijalankan.',
              });
            } finally {
              setConfirmState(null);
            }
          }}
        />
      )}
    </main>
  );
};
