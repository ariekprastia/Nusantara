import type { AdminConfig, ExamResult, QuestionItem } from '../types/exam.ts';

interface SheetInfo {
  properties: {
    sheetId: number;
    title: string;
  };
}

interface SpreadsheetMeta {
  spreadsheetId: string;
  properties: { title: string };
  sheets: SheetInfo[];
}

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsFetch<T>(
  url: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    let msg = `Google Sheets API error (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) msg = parsed.error.message;
    } catch {
      // keep fallback message
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

export async function inspectSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetMeta> {
  return sheetsFetch<SpreadsheetMeta>(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title)`,
    accessToken
  );
}

export async function createExamSpreadsheet(
  accessToken: string,
  title = 'Nusantara CBT - Bank Soal & Hasil Ujian'
): Promise<{ spreadsheetId: string; title: string; sheetTitles: string[] }> {
  const created = await sheetsFetch<SpreadsheetMeta>(SHEETS_BASE, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Hasil_Ujian' } },
        { properties: { title: 'Bank_Soal' } },
        { properties: { title: 'Konfigurasi_Admin' } },
      ],
    }),
  });

  const id = created.spreadsheetId;

  // Seed headers cleanly across the 3 created tabs
  await sheetsFetch(
    `${SHEETS_BASE}/${encodeURIComponent(id)}/values:batchUpdate`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: `'Hasil_Ujian'!A1:M1`,
            values: [
              [
                'ID',
                'Timestamp',
                'Nama_Peserta_Didik',
                'Kelas',
                'Sekolah',
                'Jenjang',
                'Kurikulum',
                'Mata_Pelajaran',
                'Metode_Pembelajaran',
                'Kesulitan',
                'Mode_Simulasi',
                'Skor',
                'Benar/Total',
              ],
            ],
          },
          {
            range: `'Bank_Soal'!A1:M1`,
            values: [
              [
                'ID',
                'Jenjang',
                'Kelas',
                'Kurikulum',
                'Mapel',
                'Kesulitan',
                'Metode_Pembelajaran',
                'Topik',
                'Soal',
                'Opsi_JSON',
                'Index_Benar',
                'Pembahasan',
                'Gambar_Atau_SVG',
              ],
            ],
          },
          {
            range: `'Konfigurasi_Admin'!A1:B6`,
            values: [
              ['Parameter', 'Nilai'],
              ['Nama_Portal', 'Nusantara CBT'],
              ['KKM_Default', '75'],
              ['Durasi_Default_Menit', '30'],
              ['PIN_Buka_Kunci', '1234'],
              ['Terakhir_Sinkron', new Date().toISOString()],
            ],
          },
        ],
      }),
    }
  );

  return {
    spreadsheetId: id,
    title: created.properties.title,
    sheetTitles: created.sheets.map((s) => s.properties.title),
  };
}

async function ensureRequiredTabs(
  accessToken: string,
  spreadsheetId: string,
  requiredTabs: string[]
): Promise<string[]> {
  const meta = await inspectSpreadsheet(accessToken, spreadsheetId);
  const existingTitles = meta.sheets.map((s) => s.properties.title);
  const missing = requiredTabs.filter((t) => !existingTitles.includes(t));

  if (missing.length > 0) {
    await sheetsFetch(
      `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({
          requests: missing.map((title) => ({
            addSheet: { properties: { title } },
          })),
        }),
      }
    );
  }

  return [...existingTitles, ...missing];
}

export async function syncResultsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  results: ExamResult[]
): Promise<{ syncedRows: number }> {
  await ensureRequiredTabs(accessToken, spreadsheetId, ['Hasil_Ujian']);

  const header = [
    'ID',
    'Timestamp',
    'Nama_Peserta_Didik',
    'Kelas',
    'Sekolah',
    'Jenjang',
    'Kurikulum',
    'Mata_Pelajaran',
    'Metode_Pembelajaran',
    'Kesulitan',
    'Mode_Simulasi',
    'Skor',
    'Benar/Total',
  ];

  const rows = results.map((r) => [
    r.id,
    r.timestamp,
    r.studentName,
    r.studentClass || r.kelas,
    r.schoolName || '-',
    r.jenjang,
    r.kurikulum,
    r.mapel,
    r.learningMethod,
    r.difficulty,
    r.mode === 'ujian' ? 'Simulasi Ujian' : 'Latihan Mandiri',
    String(r.score),
    `${r.correctCount}/${r.totalQuestions}`,
  ]);

  await sheetsFetch(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent("'Hasil_Ujian'!A:M")}:clear`,
    accessToken,
    { method: 'POST', body: JSON.stringify({}) }
  );

  await sheetsFetch(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent("'Hasil_Ujian'!A1")}?valueInputOption=USER_ENTERED`,
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: `'Hasil_Ujian'!A1`,
        majorDimension: 'ROWS',
        values: [header, ...rows],
      }),
    }
  );

  return { syncedRows: rows.length };
}

export async function syncBankToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  questions: QuestionItem[],
  adminConfig?: AdminConfig
): Promise<{ syncedQuestions: number }> {
  await ensureRequiredTabs(accessToken, spreadsheetId, [
    'Bank_Soal',
    'Konfigurasi_Admin',
  ]);

  const header = [
    'ID',
    'Jenjang',
    'Kelas',
    'Kurikulum',
    'Mapel',
    'Kesulitan',
    'Metode_Pembelajaran',
    'Topik',
    'Soal',
    'Opsi_JSON',
    'Index_Benar',
    'Pembahasan',
    'Gambar_Atau_SVG',
  ];

  const rows = questions.map((q) => [
    q.id,
    q.jenjang,
    q.kelas,
    q.kurikulum,
    q.mapel,
    q.difficulty,
    q.learningMethod,
    q.topic,
    q.prompt,
    JSON.stringify(q.options),
    String(q.correctIndex),
    q.explanation,
    q.imageUrl || (q.svgDiagram ? '[SVG_DIAGRAM]' : ''),
  ]);

  await sheetsFetch(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent("'Bank_Soal'!A:M")}:clear`,
    accessToken,
    { method: 'POST', body: JSON.stringify({}) }
  );

  await sheetsFetch(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent("'Bank_Soal'!A1")}?valueInputOption=USER_ENTERED`,
    accessToken,
    {
      method: 'PUT',
      body: JSON.stringify({
        range: `'Bank_Soal'!A1`,
        majorDimension: 'ROWS',
        values: [header, ...rows],
      }),
    }
  );

  if (adminConfig) {
    await sheetsFetch(
      `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent("'Konfigurasi_Admin'!A1")}?valueInputOption=USER_ENTERED`,
      accessToken,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `'Konfigurasi_Admin'!A1`,
          majorDimension: 'ROWS',
          values: [
            ['Parameter', 'Nilai'],
            ['Nama_Portal', adminConfig.schoolTitle],
            ['KKM_Default', String(adminConfig.defaultKkm)],
            ['Durasi_Default_Menit', String(adminConfig.defaultDurationMinutes)],
            ['PIN_Buka_Kunci', adminConfig.unlockPin],
            ['Terakhir_Sinkron', new Date().toISOString()],
          ],
        }),
      }
    );
  }

  return { syncedQuestions: rows.length };
}

export async function pullBankFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<QuestionItem[]> {
  const meta = await inspectSpreadsheet(accessToken, spreadsheetId);
  const tabExists = meta.sheets.some((s) => s.properties.title === 'Bank_Soal');
  const targetTab = tabExists ? 'Bank_Soal' : meta.sheets[0]?.properties.title;
  if (!targetTab) {
    throw new Error('Spreadsheet tidak memiliki tab lembar kerja yang dapat dibaca.');
  }

  const data = await sheetsFetch<{ values?: string[][] }>(
    `${SHEETS_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(`'${targetTab}'!A1:M500`)}`,
    accessToken
  );

  const rows = data.values ?? [];
  if (rows.length <= 1) return [];

  const parsed: QuestionItem[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r[8]) continue;
    let options: string[] = ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'];
    try {
      const maybeArr = JSON.parse(r[9] || '[]');
      if (Array.isArray(maybeArr) && maybeArr.length >= 2) {
        options = maybeArr.map(String);
      }
    } catch {
      if (r[9]) options = r[9].split('|').map((s) => s.trim());
    }

    const jenjang = r[1] === 'SD' || r[1] === 'SMP' || r[1] === 'SMA' ? r[1] : 'SMP';
    const kurikulum =
      r[3] === 'Kurikulum 2013' ? 'Kurikulum 2013' : 'Kurikulum Merdeka';
    const difficulty =
      r[5] === 'mudah' || r[5] === 'sedang' || r[5] === 'sulit' ? r[5] : 'sedang';
    const media = r[12] || '';
    const hasImage = Boolean(media && media !== '[SVG_DIAGRAM]');

    parsed.push({
      id: r[0] || `sheets-${i}-${Date.now()}`,
      jenjang,
      kelas: r[2] || `Kelas ${jenjang}`,
      kurikulum,
      mapel: r[4] || 'Matematika',
      difficulty,
      learningMethod: r[6] || 'Problem-Based Learning (PBL)',
      topic: r[7] || 'Materi Kurikulum',
      prompt: r[8],
      options,
      correctIndex: Math.max(0, Math.min(options.length - 1, Number(r[10]) || 0)),
      explanation: r[11] || 'Pembahasan merujuk pada kompetensi inti materi terkait.',
      hasImage,
      imageUrl: hasImage && media.startsWith('http') ? media : undefined,
      source: 'sheets',
    });
  }

  return parsed;
}
