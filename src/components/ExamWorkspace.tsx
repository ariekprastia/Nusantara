import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  Lock,
  Send,
  XCircle,
} from 'lucide-react';
import type { ExamSession } from '../types/exam.ts';
import { QuestionMedia } from './QuestionMedia.tsx';

interface ExamWorkspaceProps {
  session: ExamSession;
  onUpdateSession: (updater: (prev: ExamSession) => ExamSession) => void;
  onSubmitExam: (finalSession: ExamSession) => void;
  onRequestUnlockHome: () => void;
  onRequestUnlockRegenerate: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ExamWorkspace: React.FC<ExamWorkspaceProps> = ({
  session,
  onUpdateSession,
  onSubmitExam,
  onRequestUnlockHome,
  onRequestUnlockRegenerate,
}) => {
  const [missingNumbers, setMissingNumbers] = useState<number[]>([]);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);

  const currentQuestion = session.questions[session.activeIndex];
  const totalQuestions = session.questions.length;
  const answeredCount = Object.keys(session.answers).length;
  const unansweredIndexes = session.questions
    .map((_, idx) => idx)
    .filter((idx) => session.answers[idx] === undefined);

  const isPractice = session.config.mode === 'latihan';
  const hasCheckedCurrent = session.checkedPractice.includes(session.activeIndex);
  const selectedOption = session.answers[session.activeIndex];
  const isFlaggedCurrent = session.flagged.includes(session.activeIndex);

  // Live countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      onUpdateSession((prev) => {
        if (prev.submittedAt) return prev;
        if (prev.remainingSeconds <= 1) {
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [onUpdateSession]);

  // Auto-submit when countdown hits 0 in Simulasi Ujian
  useEffect(() => {
    if (
      session.config.mode === 'ujian' &&
      session.remainingSeconds === 0 &&
      !session.submittedAt
    ) {
      onSubmitExam(session);
    }
  }, [session, onSubmitExam]);

  const handleSelectOption = (optionIdx: number) => {
    onUpdateSession((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.activeIndex]: optionIdx,
      },
    }));
    if (missingNumbers.length > 0) {
      setMissingNumbers((prev) => prev.filter((n) => n !== session.activeIndex + 1));
    }
  };

  const handleToggleFlag = () => {
    onUpdateSession((prev) => {
      const exists = prev.flagged.includes(prev.activeIndex);
      return {
        ...prev,
        flagged: exists
          ? prev.flagged.filter((i) => i !== prev.activeIndex)
          : [...prev.flagged, prev.activeIndex],
      };
    });
  };

  const handleCheckPracticeAnswer = () => {
    if (selectedOption === undefined) return;
    onUpdateSession((prev) => {
      if (prev.checkedPractice.includes(prev.activeIndex)) return prev;
      return {
        ...prev,
        checkedPractice: [...prev.checkedPractice, prev.activeIndex],
      };
    });
  };

  const handleJumpTo = (idx: number) => {
    onUpdateSession((prev) => ({ ...prev, activeIndex: idx }));
  };

  const handleAttemptFinish = () => {
    if (unansweredIndexes.length > 0) {
      const firstUnanswered = unansweredIndexes[0];
      setMissingNumbers(unansweredIndexes.map((i) => i + 1));
      // Immediately redirect student to the first unanswered question
      handleJumpTo(firstUnanswered);
      return;
    }
    setMissingNumbers([]);
    setConfirmFinishOpen(true);
  };

  if (!currentQuestion) return null;

  const isWarningTime = session.remainingSeconds <= 300;
  const isCriticalTime = session.remainingSeconds <= 60;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Locked Session Header Bar */}
      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-900">
              {session.config.mode === 'ujian' ? 'Simulasi Ujian Resmi' : 'Latihan Mandiri'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{session.config.jenjang} ({session.config.kelas})</span>
            <span aria-hidden="true">·</span>
            <span>{session.config.kurikulum}</span>
          </div>
          <h1 className="mt-1 font-display text-lg font-bold text-slate-900">
            {session.config.mapel} — {session.config.studentName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Metode: {session.config.learningMethodName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 font-mono text-sm font-bold tabular-nums ${
              isCriticalTime
                ? 'border-red-300 bg-red-50 text-red-700'
                : isWarningTime
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatTimer(session.remainingSeconds)}</span>
            {isCriticalTime && <span className="font-sans text-xs font-semibold">Segera Habis</span>}
          </div>

          <button
            type="button"
            onClick={onRequestUnlockRegenerate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Lock className="h-3.5 w-3.5 text-amber-700" />
            <span>Generate Baru</span>
          </button>

          <button
            type="button"
            onClick={onRequestUnlockHome}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
          >
            <Lock className="h-3.5 w-3.5 text-amber-700" />
            <span>Beranda</span>
          </button>
        </div>
      </section>

      {/* Missing Answer Redirect Banner */}
      {missingNumbers.length > 0 && (
        <div
          role="alert"
          className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold">
                Semua soal wajib dijawab sebelum mengumpulkan!
              </p>
              <p className="mt-0.5 text-xs text-amber-900">
                Masih ada <strong className="font-mono tabular-nums">{missingNumbers.length}</strong> soal kosong (Nomor:{' '}
                <span className="font-mono font-semibold">{missingNumbers.join(', ')}</span>). Anda telah diarahkan langsung ke soal nomor{' '}
                <strong className="font-mono">{missingNumbers[0]}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMissingNumbers([])}
            className="self-start rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer shrink-0"
          >
            Tutup Peringatan
          </button>
        </div>
      )}

      {/* Main CBT Split Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Question Area */}
        <section className="lg:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                  Soal {session.activeIndex + 1} / {totalQuestions}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize font-medium text-slate-700">
                  Tingkat: {currentQuestion.difficulty}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.topic}</span>
              </div>

              <button
                type="button"
                onClick={handleToggleFlag}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  isFlaggedCurrent
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{isFlaggedCurrent ? 'Ditandai Ragu' : 'Tandai Ragu-ragu'}</span>
              </button>
            </div>

            {/* Optional Question Illustration */}
            {currentQuestion.hasImage && (
              <QuestionMedia
                imageUrl={currentQuestion.imageUrl}
                svgDiagram={currentQuestion.svgDiagram}
                caption={currentQuestion.imageCaption}
                alt={`Ilustrasi soal nomor ${session.activeIndex + 1}`}
              />
            )}

            {/* Prompt */}
            <div className="mt-4 text-base leading-relaxed text-slate-900 whitespace-pre-line">
              {currentQuestion.prompt}
            </div>

            {/* Answer Options */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOpt = idx === currentQuestion.correctIndex;
                let stateClass =
                  'border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-slate-50';

                if (isPractice && hasCheckedCurrent) {
                  if (isCorrectOpt) {
                    stateClass = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                  } else if (isSelected && !isCorrectOpt) {
                    stateClass = 'border-red-400 bg-red-50 text-red-950';
                  } else {
                    stateClass = 'border-slate-200 bg-slate-50/50 text-slate-500';
                  }
                } else if (isSelected) {
                  stateClass = 'border-blue-900 bg-blue-50/80 text-slate-900';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`flex min-h-[48px] w-full items-start gap-3.5 rounded-xl border p-3.5 text-left transition-colors cursor-pointer ${stateClass}`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'border border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {OPTION_LETTERS[idx] || idx + 1}
                    </span>
                    <span className="pt-0.5 text-sm leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Immediate Check & Explanation */}
            {isPractice && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                {!hasCheckedCurrent ? (
                  <button
                    type="button"
                    disabled={selectedOption === undefined}
                    onClick={handleCheckPracticeAnswer}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-900 bg-white px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Periksa Jawaban &amp; Pembahasan (Latihan Mandiri)</span>
                  </button>
                ) : (
                  <div
                    className={`rounded-xl border p-4 ${
                      selectedOption === currentQuestion.correctIndex
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {selectedOption === currentQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          <span className="text-emerald-900">Jawaban Anda Benar</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-700" />
                          <span className="text-red-900">
                            Kurang Tepat — Kunci: {OPTION_LETTERS[currentQuestion.correctIndex]}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-800">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Prev / Next / Finish Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={session.activeIndex === 0}
                onClick={() => handleJumpTo(session.activeIndex - 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </button>

              {session.activeIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => handleJumpTo(session.activeIndex + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  <span>Soal Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAttemptFinish}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Selesai &amp; Kumpulkan</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar: Question Navigator */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-display text-base font-bold text-slate-900">
              Navigasi Nomor Soal
            </h2>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              Terjawab: {answeredCount}/{totalQuestions} · Belum: {unansweredIndexes.length}
            </p>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {session.questions.map((q, idx) => {
                const isActive = idx === session.activeIndex;
                const isAnswered = session.answers[idx] !== undefined;
                const isFlagged = session.flagged.includes(idx);

                let btnClass =
                  'border-slate-200 bg-white text-slate-700 hover:border-slate-400';
                if (isActive) {
                  btnClass = 'border-blue-900 bg-blue-900 text-white ring-2 ring-blue-900/20';
                } else if (isFlagged) {
                  btnClass = 'border-amber-400 bg-amber-50 text-amber-900';
                } else if (isAnswered) {
                  btnClass = 'border-emerald-400 bg-emerald-50 text-emerald-900';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpTo(idx)}
                    className={`relative flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-bold tabular-nums transition-colors cursor-pointer ${btnClass}`}
                    title={`Soal ${idx + 1}${isAnswered ? ' (Sudah dijawab)' : ' (Belum dijawab)'}`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && !isActive && (
                      <span className="ml-0.5 text-[10px]" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded border border-emerald-400 bg-emerald-50" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded border border-slate-300 bg-white" />
                <span>Belum Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded border border-amber-400 bg-amber-50" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 rounded bg-blue-900" />
                <span>Aktif</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAttemptFinish}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Koreksi &amp; Selesaikan Ujian</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Confirmation dialog when all questions are answered */}
      {confirmFinishOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Konfirmasi Pengumpulan Jawaban
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Seluruh <strong className="font-mono">{totalQuestions}</strong> soal telah terjawab dengan lengkap. Apakah Anda yakin ingin mengakhiri simulasi dan melihat hasil skor beserta pembahasannya?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmFinishOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmFinishOpen(false);
                  onSubmitExam(session);
                }}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 cursor-pointer"
              >
                Ya, Kumpulkan Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
