import { useCallback, useEffect, useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ExamWorkspace } from './components/ExamWorkspace.tsx';
import { PinUnlockModal } from './components/PinUnlockModal.tsx';
import { ResultReview } from './components/ResultReview.tsx';
import { SetupPortal } from './components/SetupPortal.tsx';
import { TopNavbar, type AppView } from './components/TopNavbar.tsx';
import type {
  ExamConfig,
  ExamResult,
  ExamSession,
  PublicAdminConfig,
  QuestionItem,
} from './types/exam.ts';

const STORAGE_SESSION_KEY = 'nusantara_cbt_active_session_v1';
const STORAGE_RESULT_KEY = 'nusantara_cbt_active_result_v1';

export default function App() {
  const [publicConfig, setPublicConfig] = useState<PublicAdminConfig>({
    defaultKkm: 75,
    defaultDurationMinutes: 30,
    spreadsheetId: '',
    schoolTitle: 'Nusantara CBT',
  });

  const [session, setSession] = useState<ExamSession | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
      return raw ? (JSON.parse(raw) as ExamSession) : null;
    } catch {
      return null;
    }
  });

  const [result, setResult] = useState<ExamResult | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_RESULT_KEY);
      return raw ? (JSON.parse(raw) as ExamResult) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      if (sessionStorage.getItem(STORAGE_RESULT_KEY)) return 'result';
      if (sessionStorage.getItem(STORAGE_SESSION_KEY)) return 'exam';
    } catch {
      // ignore storage failure
    }
    return 'setup';
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinActionLabel, setPinActionLabel] = useState(
    'kembali ke halaman utama / generate soal baru'
  );

  const isExamLocked = Boolean(session || result);

  const loadPublicConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config/public');
      if (res.ok) {
        const data = (await res.json()) as PublicAdminConfig;
        setPublicConfig(data);
      }
    } catch {
      // keep default config
    }
  }, []);

  useEffect(() => {
    loadPublicConfig();
  }, [loadPublicConfig]);

  useEffect(() => {
    try {
      if (session) {
        sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }, [session]);

  useEffect(() => {
    try {
      if (result) {
        sessionStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
      } else {
        sessionStorage.removeItem(STORAGE_RESULT_KEY);
      }
    } catch {
      // ignore
    }
  }, [result]);

  const handleStartSimulation = async (config: ExamConfig) => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as {
        questions?: QuestionItem[];
        error?: string;
      };
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Gagal menyusun soal ujian.');
      }

      const newSession: ExamSession = {
        sessionId: `SES-${Date.now()}`,
        config,
        questions: data.questions,
        answers: {},
        flagged: [],
        checkedPractice: [],
        activeIndex: 0,
        remainingSeconds: config.durationMinutes * 60,
        isLocked: true,
        startedAt: new Date().toISOString(),
      };

      setResult(null);
      setSession(newSession);
      setCurrentView('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat generate soal.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitExam = useCallback(
    async (finalSession: ExamSession) => {
      const total = finalSession.questions.length;
      let correctCount = 0;
      const breakdown = {
        mudah: { correct: 0, total: 0 },
        sedang: { correct: 0, total: 0 },
        sulit: { correct: 0, total: 0 },
      };

      const wrongItems: ExamResult['wrongItems'] = [];

      finalSession.questions.forEach((q, idx) => {
        const selected = finalSession.answers[idx];
        const tier = q.difficulty;
        breakdown[tier].total += 1;

        if (selected === q.correctIndex) {
          correctCount += 1;
          breakdown[tier].correct += 1;
        } else {
          wrongItems.push({
            questionNumber: idx + 1,
            question: q,
            selectedAnswerIndex: selected !== undefined ? selected : null,
          });
        }
      });

      const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const kkm = publicConfig.defaultKkm || 75;
      const totalAllocated = finalSession.config.durationMinutes * 60;
      const usedSeconds = Math.max(1, totalAllocated - finalSession.remainingSeconds);

      const examResult: ExamResult = {
        id: `RES-${Date.now()}`,
        studentName: finalSession.config.studentName,
        studentClass: finalSession.config.studentClass,
        schoolName: finalSession.config.schoolName,
        jenjang: finalSession.config.jenjang,
        kelas: finalSession.config.kelas,
        kurikulum: finalSession.config.kurikulum,
        mapel: finalSession.config.mapel,
        learningMethod: finalSession.config.learningMethodName,
        difficulty: finalSession.config.difficulty,
        mode: finalSession.config.mode,
        score,
        kkm,
        passed: score >= kkm,
        correctCount,
        wrongCount: total - correctCount,
        totalQuestions: total,
        durationUsedSeconds: usedSeconds,
        breakdownByDifficulty: breakdown,
        wrongItems,
        allAnswers: finalSession.answers,
        questions: finalSession.questions,
        timestamp: new Date().toISOString(),
      };

      setSession(null);
      setResult(examResult);
      setCurrentView('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(examResult),
        });
      } catch {
        // Result already displayed locally even if network retry needed
      }
    },
    [publicConfig.defaultKkm]
  );

  const requestUnlockAction = (label: string) => {
    setPinActionLabel(label);
    setPinModalOpen(true);
  };

  const handlePinVerified = () => {
    setPinModalOpen(false);
    setSession(null);
    setResult(null);
    setGenerationError(null);
    setCurrentView('setup');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSetup = () => {
    if (isExamLocked) {
      requestUnlockAction('kembali ke halaman utama dan membuat paket soal baru');
      return;
    }
    setCurrentView('setup');
  };

  const handleScrollSection = (sectionId: string) => {
    if (isExamLocked) {
      requestUnlockAction('kembali ke konfigurasi kurikulum & metode');
      return;
    }
    if (currentView !== 'setup') {
      setCurrentView('setup');
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExitAdmin = () => {
    if (result) {
      setCurrentView('result');
    } else if (session) {
      setCurrentView('exam');
    } else {
      setCurrentView('setup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopNavbar
        schoolTitle={publicConfig.schoolTitle}
        currentView={currentView}
        isExamLocked={isExamLocked}
        onNavigateSetup={handleNavigateSetup}
        onNavigateAdmin={() => setCurrentView('admin')}
        onScrollSection={handleScrollSection}
      />

      <div className="flex-1">
        {currentView === 'setup' && (
          <SetupPortal
            publicConfig={publicConfig}
            isGenerating={isGenerating}
            generationError={generationError}
            onStartSimulation={handleStartSimulation}
          />
        )}

        {currentView === 'exam' && session && (
          <ExamWorkspace
            session={session}
            onUpdateSession={(updater) =>
              setSession((prev) => (prev ? updater(prev) : prev))
            }
            onSubmitExam={handleSubmitExam}
            onRequestUnlockHome={() => requestUnlockAction('kembali ke halaman utama')}
            onRequestUnlockRegenerate={() =>
              requestUnlockAction('generate paket soal baru')
            }
          />
        )}

        {currentView === 'result' && result && (
          <ResultReview
            result={result}
            onRequestUnlockHome={() => requestUnlockAction('kembali ke halaman utama')}
            onRequestUnlockRegenerate={() =>
              requestUnlockAction('generate paket soal baru')
            }
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onConfigUpdated={loadPublicConfig}
            onExitAdmin={handleExitAdmin}
          />
        )}
      </div>

      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <span>
            {publicConfig.schoolTitle || 'Nusantara CBT'} · Portal Simulasi Ujian &amp; Latihan Kurikulum Indonesia (SD, SMP, SMA)
          </span>
          <span>Kurikulum Merdeka &amp; K-13 · Dukungan Google Sheets &amp; Apps Script</span>
        </div>
      </footer>

      <PinUnlockModal
        isOpen={pinModalOpen}
        actionLabel={pinActionLabel}
        onClose={() => setPinModalOpen(false)}
        onVerified={handlePinVerified}
      />
    </div>
  );
}
