import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Lock,
  Printer,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import type { ExamResult } from '../types/exam.ts';
import { QuestionMedia } from './QuestionMedia.tsx';

interface ResultReviewProps {
  result: ExamResult;
  onRequestUnlockHome: () => void;
  onRequestUnlockRegenerate: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}d`;
}

export const ResultReview: React.FC<ResultReviewProps> = ({
  result,
  onRequestUnlockHome,
  onRequestUnlockRegenerate,
}) => {
  const [reviewFilter, setReviewFilter] = useState<'wrong' | 'all'>('wrong');

  const itemsToDisplay =
    reviewFilter === 'wrong'
      ? result.wrongItems
      : result.questions.map((q, idx) => ({
          questionNumber: idx + 1,
          question: q,
          selectedAnswerIndex:
            result.allAnswers[idx] !== undefined ? result.allAnswers[idx] : null,
        }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Score Overview Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-900">
                {result.mode === 'ujian' ? 'Hasil Simulasi Ujian' : 'Hasil Latihan Mandiri'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{result.jenjang} ({result.kelas})</span>
              <span aria-hidden="true">·</span>
              <span>{result.kurikulum}</span>
            </div>

            <h1 className="mt-1.5 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {result.studentName}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {result.mapel} · Metode: {result.learningMethod}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {result.passed ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tuntas KKM (≥ {result.kkm})</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                  <Award className="h-4 w-4" />
                  <span>Perlu Penguatan Materi (KKM {result.kkm})</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono tabular-nums">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Waktu: {formatDuration(result.durationUsedSeconds)}</span>
              </span>
            </div>
          </div>

          {/* Numeric Score KPI Block */}
          <div className="flex items-center gap-6 border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
            <div>
              <div className="text-xs font-semibold text-slate-500">Nilai Akhir</div>
              <div
                className={`mt-0.5 font-mono text-5xl font-bold tracking-tight tabular-nums ${
                  result.passed ? 'text-emerald-700' : 'text-blue-900'
                }`}
              >
                {result.score}
              </div>
            </div>

            <div className="space-y-1.5 text-sm font-mono tabular-nums">
              <div className="flex items-center justify-between gap-4 text-emerald-700">
                <span className="font-sans text-xs text-slate-500">Benar</span>
                <span className="font-bold">{result.correctCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-red-600">
                <span className="font-sans text-xs text-slate-500">Salah</span>
                <span className="font-bold">{result.wrongCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-900">
                <span className="font-sans text-xs text-slate-500">Total</span>
                <span className="font-bold">{result.totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          {(['mudah', 'sedang', 'sulit'] as const).map((tier) => {
            const stat = result.breakdownByDifficulty[tier];
            const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div key={tier} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold capitalize text-slate-700">
                    Tingkat {tier}
                  </span>
                  <span className="font-mono font-bold tabular-nums text-slate-900">
                    {stat.correct}/{stat.total} ({pct}%)
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-900 transition-all"
                    style={{ width: `${stat.total > 0 ? pct : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked Action Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="text-xs text-slate-500">
            Paket soal ini masih dalam penguncian sesi. Gunakan PIN Admin untuk kembali ke beranda atau membuat simulasi baru.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Laporan</span>
            </button>
            <button
              type="button"
              onClick={onRequestUnlockRegenerate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-900 bg-white px-4 py-2 text-xs font-semibold text-blue-900 hover:bg-blue-50 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Generate Soal Baru (PIN Admin)</span>
            </button>
            <button
              type="button"
              onClick={onRequestUnlockHome}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Kembali ke Beranda (PIN Admin)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pembahasan Soal yang Salah */}
      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Pembahasan Evaluasi Jawaban
            </h2>
            <p className="text-sm text-slate-600">
              Pelajari penjelasan materi untuk setiap soal yang jawabannya masih keliru.
            </p>
          </div>

          <div className="inline-flex rounded-lg bg-slate-200/70 p-1 self-start">
            <button
              type="button"
              onClick={() => setReviewFilter('wrong')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                reviewFilter === 'wrong'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Soal Salah Saja ({result.wrongItems.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter('all')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Soal ({result.questions.length})
            </button>
          </div>
        </div>

        {itemsToDisplay.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />
            <h3 className="mt-3 font-display text-lg font-bold text-emerald-950">
              Sempurna! Tidak Ada Jawaban yang Salah
            </h3>
            <p className="mt-1 text-sm text-emerald-800">
              Seluruh {result.totalQuestions} butir soal berhasil dijawab dengan benar. Anda dapat menekan &ldquo;Semua Soal&rdquo; untuk meninjau ulang pembahasan lengkapnya.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {itemsToDisplay.map((entry) => {
              const q = entry.question;
              const isCorrect = entry.selectedAnswerIndex === q.correctIndex;
              const selectedText =
                entry.selectedAnswerIndex !== null
                  ? `${OPTION_LETTERS[entry.selectedAnswerIndex]}. ${q.options[entry.selectedAnswerIndex]}`
                  : 'Tidak dijawab';
              const correctText = `${OPTION_LETTERS[q.correctIndex]}. ${q.options[q.correctIndex]}`;

              return (
                <article
                  key={`${q.id}-${entry.questionNumber}`}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                        Soal Nomor {entry.questionNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{q.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.topic}</span>
                    </div>

                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Jawaban Benar</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                        <XCircle className="h-4 w-4" />
                        <span>Jawaban Salah</span>
                      </span>
                    )}
                  </div>

                  {q.hasImage && (
                    <QuestionMedia
                      imageUrl={q.imageUrl}
                      svgDiagram={q.svgDiagram}
                      caption={q.imageCaption}
                      alt={`Ilustrasi pembahasan soal ${entry.questionNumber}`}
                      compact
                    />
                  )}

                  <p className="mt-4 text-sm font-medium leading-relaxed text-slate-900 whitespace-pre-line">
                    {q.prompt}
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div
                      className={`rounded-lg border p-3 text-xs ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-red-200 bg-red-50 text-red-900'
                      }`}
                    >
                      <div className="font-bold">Jawaban Anda</div>
                      <div className="mt-1 leading-relaxed">{selectedText}</div>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                      <div className="font-bold">Kunci Jawaban Benar</div>
                      <div className="mt-1 leading-relaxed">{correctText}</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold text-slate-800">
                      Penjelasan &amp; Pembahasan Materi
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                      {q.explanation}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};
