import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_QUESTION_BANK } from './src/data/defaultQuestions.ts';
import { generateLocalExamPackage } from './src/engine/localQuestionEngine.ts';
import type {
  AdminConfig,
  DifficultyOption,
  ExamResult,
  Jenjang,
  Kurikulum,
  QuestionItem,
} from './src/types/exam.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '.data');
const STORE_PATH = path.join(DATA_DIR, 'cbt-store.json');

interface PersistentStore {
  adminConfig: AdminConfig;
  bank: QuestionItem[];
  results: ExamResult[];
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  adminPassword: 'admin123',
  unlockPin: '1234',
  defaultKkm: 75,
  defaultDurationMinutes: 30,
  spreadsheetId: '',
  schoolTitle: 'Nusantara CBT',
};

function loadStore(): PersistentStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial: PersistentStore = {
        adminConfig: { ...DEFAULT_ADMIN_CONFIG },
        bank: [...DEFAULT_QUESTION_BANK],
        results: [],
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<PersistentStore>;
    return {
      adminConfig: { ...DEFAULT_ADMIN_CONFIG, ...(parsed.adminConfig ?? {}) },
      bank:
        Array.isArray(parsed.bank) && parsed.bank.length > 0
          ? parsed.bank
          : [...DEFAULT_QUESTION_BANK],
      results: Array.isArray(parsed.results) ? parsed.results : [],
    };
  } catch {
    return {
      adminConfig: { ...DEFAULT_ADMIN_CONFIG },
      bank: [...DEFAULT_QUESTION_BANK],
      results: [],
    };
  }
}

function saveStore(store: PersistentStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  const checkAdminAuth = (req: express.Request): boolean => {
    const store = loadStore();
    const headerPwd = req.headers['x-admin-password'];
    return typeof headerPwd === 'string' && headerPwd === store.adminConfig.adminPassword;
  };

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', engine: 'local-zero-cost' });
  });

  app.get('/api/config/public', (_req, res) => {
    const store = loadStore();
    res.json({
      defaultKkm: store.adminConfig.defaultKkm,
      defaultDurationMinutes: store.adminConfig.defaultDurationMinutes,
      spreadsheetId: store.adminConfig.spreadsheetId,
      schoolTitle: store.adminConfig.schoolTitle,
    });
  });

  // 100% Free Local Question & SVG Illustration Engine (Zero API Keys / Zero Tokens)
  app.post('/api/questions/generate', (req, res) => {
    try {
      const body = req.body as {
        studentName?: string;
        jenjang?: Jenjang;
        kelas?: string;
        kurikulum?: Kurikulum;
        mapel?: string;
        learningMethodName?: string;
        difficulty?: DifficultyOption;
        totalQuestions?: number;
        imageQuestionsCount?: number;
      };

      if (!body.studentName || !body.studentName.trim()) {
        res.status(400).json({ error: 'Nama peserta didik wajib diisi dan tidak boleh kosong.' });
        return;
      }

      const totalQuestions = Math.max(1, Math.min(50, Number(body.totalQuestions) || 10));
      const imageQuestionsCount = Math.max(
        0,
        Math.min(totalQuestions, Number(body.imageQuestionsCount) || 0)
      );

      const jenjang: Jenjang =
        body.jenjang === 'SD' || body.jenjang === 'SMP' || body.jenjang === 'SMA'
          ? body.jenjang
          : 'SMP';
      const kelas = body.kelas || `Kelas ${jenjang}`;
      const kurikulum: Kurikulum =
        body.kurikulum === 'Kurikulum 2013' ? 'Kurikulum 2013' : 'Kurikulum Merdeka';
      const mapel = body.mapel || 'Matematika';
      const difficulty: DifficultyOption =
        body.difficulty === 'mudah' ||
        body.difficulty === 'sedang' ||
        body.difficulty === 'sulit' ||
        body.difficulty === 'campuran'
          ? body.difficulty
          : 'campuran';
      const learningMethodName = body.learningMethodName || 'Problem-Based Learning (PBL)';

      const store = loadStore();
      const generated = generateLocalExamPackage({
        bank: store.bank,
        jenjang,
        kelas,
        kurikulum,
        mapel,
        learningMethodName,
        difficulty,
        totalQuestions,
        imageQuestionsCount,
      });

      res.json(generated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyusun paket soal lokal.';
      console.error('Local generate error:', err);
      res.status(500).json({ error: message });
    }
  });

  // Results endpoints
  app.get('/api/results', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const store = loadStore();
    res.json({ results: store.results });
  });

  app.post('/api/results', (req, res) => {
    const result = req.body as ExamResult;
    if (!result || !result.studentName) {
      res.status(400).json({ error: 'Data hasil ujian tidak lengkap.' });
      return;
    }
    const store = loadStore();
    store.results = [result, ...store.results].slice(0, 500);
    saveStore(store);
    res.json({ ok: true, result });
  });

  app.delete('/api/results/:id', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const store = loadStore();
    store.results = store.results.filter((r) => r.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });

  // Admin auth & PIN verification
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body as { password?: string };
    const store = loadStore();
    if (!password || password !== store.adminConfig.adminPassword) {
      res.status(401).json({ ok: false, error: 'Password Administrator salah.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/admin/verify-pin', (req, res) => {
    const { pin } = req.body as { pin?: string };
    const store = loadStore();
    if (!pin || pin.trim() !== store.adminConfig.unlockPin.trim()) {
      res.status(401).json({ ok: false, error: 'PIN Admin tidak sesuai.' });
      return;
    }
    res.json({ ok: true });
  });

  app.get('/api/admin/config', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const store = loadStore();
    res.json({ config: store.adminConfig });
  });

  app.put('/api/admin/config', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const body = req.body as Partial<AdminConfig>;
    const store = loadStore();
    store.adminConfig = {
      ...store.adminConfig,
      adminPassword:
        body.adminPassword && body.adminPassword.trim().length >= 4
          ? body.adminPassword.trim()
          : store.adminConfig.adminPassword,
      unlockPin:
        body.unlockPin && body.unlockPin.trim().length >= 4
          ? body.unlockPin.trim()
          : store.adminConfig.unlockPin,
      defaultKkm:
        typeof body.defaultKkm === 'number'
          ? Math.max(10, Math.min(100, body.defaultKkm))
          : store.adminConfig.defaultKkm,
      defaultDurationMinutes:
        typeof body.defaultDurationMinutes === 'number'
          ? Math.max(5, Math.min(240, body.defaultDurationMinutes))
          : store.adminConfig.defaultDurationMinutes,
      spreadsheetId:
        typeof body.spreadsheetId === 'string'
          ? body.spreadsheetId.trim()
          : store.adminConfig.spreadsheetId,
      schoolTitle:
        typeof body.schoolTitle === 'string' && body.schoolTitle.trim()
          ? body.schoolTitle.trim()
          : store.adminConfig.schoolTitle,
    };
    saveStore(store);
    res.json({ ok: true, config: store.adminConfig });
  });

  // Question Bank CRUD
  app.get('/api/bank', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const store = loadStore();
    res.json({ bank: store.bank });
  });

  app.post('/api/bank', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const item = req.body as QuestionItem;
    if (!item || !item.prompt || !Array.isArray(item.options) || item.options.length < 2) {
      res.status(400).json({ error: 'Data soal tidak lengkap.' });
      return;
    }
    const store = loadStore();
    const created: QuestionItem = {
      ...item,
      id: item.id || `bank-custom-${Date.now()}`,
      source: item.source || 'bank',
    };
    store.bank = [created, ...store.bank];
    saveStore(store);
    res.json({ ok: true, item: created });
  });

  app.post('/api/bank/import', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const { items } = req.body as { items?: QuestionItem[] };
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Format data impor soal tidak valid.' });
      return;
    }
    const store = loadStore();
    const existingIds = new Set(store.bank.map((q) => q.id));
    let added = 0;
    for (const q of items) {
      if (!q.prompt || !Array.isArray(q.options)) continue;
      if (existingIds.has(q.id)) {
        store.bank = store.bank.map((old) => (old.id === q.id ? q : old));
      } else {
        store.bank.unshift(q);
        existingIds.add(q.id);
        added++;
      }
    }
    saveStore(store);
    res.json({ ok: true, added, total: store.bank.length });
  });

  app.delete('/api/bank/:id', (req, res) => {
    if (!checkAdminAuth(req)) {
      res.status(401).json({ error: 'Diperlukan Password Administrator yang valid.' });
      return;
    }
    const store = loadStore();
    store.bank = store.bank.filter((q) => q.id !== req.params.id);
    saveStore(store);
    res.json({ ok: true });
  });

  // Vite dev middleware or production static assets
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nusantara CBT (100% Free Local Engine) listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
