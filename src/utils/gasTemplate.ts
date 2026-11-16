export function generateGasCodeGs(spreadsheetId?: string): string {
  const idLiteral = spreadsheetId?.trim()
    ? `'${spreadsheetId.trim()}'`
    : `''`;

  return `/**
 * Nusantara CBT — Paket Mandiri Google Apps Script (Code.gs)
 * 100% Gratis Selamanya · Tanpa Token / API Berbayar
 * Database: Google Spreadsheet (Hasil_Ujian | Bank_Soal | Konfigurasi_Admin)
 */

const TARGET_SPREADSHEET_ID = ${idLiteral};

function getDb_() {
  return TARGET_SPREADSHEET_ID
    ? SpreadsheetApp.openById(TARGET_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function doGet() {
  ensureSheetsInitialized_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Nusantara CBT — Portal Simulasi Ujian Kurikulum Indonesia')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function ensureSheetsInitialized_() {
  var ss = getDb_();
  var specs = {
    Hasil_Ujian: [
      'ID', 'Timestamp', 'Nama_Peserta_Didik', 'Kelas', 'Sekolah',
      'Jenjang', 'Kurikulum', 'Mata_Pelajaran', 'Metode_Pembelajaran',
      'Kesulitan', 'Mode_Simulasi', 'Skor', 'Benar/Total'
    ],
    Bank_Soal: [
      'ID', 'Jenjang', 'Kelas', 'Kurikulum', 'Mapel', 'Kesulitan',
      'Metode_Pembelajaran', 'Topik', 'Soal', 'Opsi_JSON',
      'Index_Benar', 'Pembahasan', 'Gambar_Atau_SVG'
    ],
    Konfigurasi_Admin: ['Parameter', 'Nilai']
  };

  Object.keys(specs).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(specs[name]);
      if (name === 'Konfigurasi_Admin') {
        sheet.appendRow(['Nama_Portal', 'Nusantara CBT']);
        sheet.appendRow(['Password_Admin', 'admin123']);
        sheet.appendRow(['PIN_Buka_Kunci', '1234']);
        sheet.appendRow(['KKM_Default', '75']);
        sheet.appendRow(['Durasi_Default_Menit', '30']);
      }
    }
  });
}

function getConfigMap_() {
  ensureSheetsInitialized_();
  var sheet = getDb_().getSheetByName('Konfigurasi_Admin');
  var rows = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < rows.length; i++) {
    map[String(rows[i][0])] = String(rows[i][1]);
  }
  return map;
}

function getPublicConfig() {
  var map = getConfigMap_();
  return {
    schoolTitle: map['Nama_Portal'] || 'Nusantara CBT',
    kkmDefault: Number(map['KKM_Default'] || 75),
    durasiDefault: Number(map['Durasi_Default_Menit'] || 30)
  };
}

function verifyAdminPin(pinInput) {
  var map = getConfigMap_();
  return String(map['PIN_Buka_Kunci'] || '1234').trim() === String(pinInput || '').trim();
}

function loginAdmin(passwordInput) {
  var map = getConfigMap_();
  return String(map['Password_Admin'] || 'admin123').trim() === String(passwordInput || '').trim();
}

function getAdminDashboardData(passwordInput) {
  if (!loginAdmin(passwordInput)) {
    throw new Error('Password Administrator tidak sesuai.');
  }
  var ss = getDb_();
  var cfg = getConfigMap_();

  var bankRows = ss.getSheetByName('Bank_Soal').getDataRange().getValues();
  var bank = [];
  for (var i = 1; i < bankRows.length; i++) {
    var r = bankRows[i];
    if (!r[8]) continue;
    bank.push({
      id: String(r[0]),
      jenjang: String(r[1]),
      kelas: String(r[2]),
      kurikulum: String(r[3]),
      mapel: String(r[4]),
      difficulty: String(r[5]),
      learningMethod: String(r[6]),
      topic: String(r[7]),
      prompt: String(r[8]),
      options: JSON.parse(r[9] || '[]'),
      correctIndex: Number(r[10] || 0),
      explanation: String(r[11] || ''),
      media: String(r[12] || '')
    });
  }

  var resRows = ss.getSheetByName('Hasil_Ujian').getDataRange().getValues();
  var results = [];
  for (var j = resRows.length - 1; j >= 1; j--) {
    var rr = resRows[j];
    results.push({
      id: String(rr[0]),
      timestamp: String(rr[1]),
      studentName: String(rr[2]),
      studentClass: String(rr[3]),
      jenjang: String(rr[5]),
      mapel: String(rr[7]),
      mode: String(rr[10]),
      score: Number(rr[11] || 0),
      ratio: String(rr[12])
    });
  }

  return {
    config: {
      schoolTitle: cfg['Nama_Portal'] || 'Nusantara CBT',
      adminPassword: cfg['Password_Admin'] || 'admin123',
      unlockPin: cfg['PIN_Buka_Kunci'] || '1234',
      kkmDefault: Number(cfg['KKM_Default'] || 75),
      durasiDefault: Number(cfg['Durasi_Default_Menit'] || 30)
    },
    bank: bank,
    results: results
  };
}

function saveAdminConfig(passwordInput, nextCfg) {
  if (!loginAdmin(passwordInput)) {
    throw new Error('Password Administrator tidak valid.');
  }
  var sheet = getDb_().getSheetByName('Konfigurasi_Admin');
  var rows = sheet.getDataRange().getValues();
  var updates = {
    Nama_Portal: nextCfg.schoolTitle,
    Password_Admin: nextCfg.adminPassword,
    PIN_Buka_Kunci: nextCfg.unlockPin,
    KKM_Default: String(nextCfg.kkmDefault),
    Durasi_Default_Menit: String(nextCfg.durasiDefault)
  };
  for (var i = 1; i < rows.length; i++) {
    var key = String(rows[i][0]);
    if (updates[key] !== undefined) {
      sheet.getRange(i + 1, 2).setValue(updates[key]);
    }
  }
  return { ok: true };
}

function addBankQuestion(passwordInput, item) {
  if (!loginAdmin(passwordInput)) {
    throw new Error('Password Administrator tidak valid.');
  }
  var sheet = getDb_().getSheetByName('Bank_Soal');
  var id = 'GAS-' + new Date().getTime();
  sheet.appendRow([
    id,
    item.jenjang,
    item.kelas || item.jenjang,
    item.kurikulum,
    item.mapel,
    item.difficulty,
    item.learningMethod || 'Problem-Based Learning (PBL)',
    item.topic || item.mapel,
    item.prompt,
    JSON.stringify(item.options),
    Number(item.correctIndex || 0),
    item.explanation,
    item.media || ''
  ]);
  return { ok: true, id: id };
}

function buildParametricGasQuestion_(params, wantsImage, seq, diff) {
  var lower = String(params.mapel || '').toLowerCase();
  var optCount = params.jenjang === 'SMA' ? 5 : 4;
  var id = 'GAS-PARAM-' + seq + '-' + Math.floor(Math.random() * 10000);

  if (lower.indexOf('matematika') !== -1) {
    var triples = [[6,8,10],[9,12,15],[5,12,13],[8,15,17]];
    var t = triples[seq % triples.length];
    var svg = '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><polygon points="110,165 290,165 110,45" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2.5"/><text x="95" y="110" text-anchor="end" font-size="14" font-weight="700" fill="#0f172a">' + t[0] + ' cm</text><text x="200" y="186" text-anchor="middle" font-size="14" font-weight="700" fill="#0f172a">' + t[1] + ' cm</text><text x="220" y="96" font-size="14" font-weight="700" fill="#1e3a8a">c = ? cm</text></svg>';
    var opts = [t[2] + ' cm', (t[2] + 2) + ' cm', (t[2] - 2) + ' cm', (t[2] + 4) + ' cm'];
    if (optCount === 5) opts.push((t[2] + 6) + ' cm');
    return {
      id: id,
      jenjang: params.jenjang,
      kelas: params.kelas,
      kurikulum: params.kurikulum,
      mapel: params.mapel,
      difficulty: diff,
      learningMethod: params.learningMethodName,
      topic: 'Geometri & Pengukuran',
      hasImage: wantsImage,
      svgDiagram: wantsImage ? svg : '',
      prompt: (wantsImage ? 'Perhatikan diagram segitiga siku-siku di atas. ' : 'Diketahui segitiga siku-siku dengan sisi tegak ' + t[0] + ' cm dan alas ' + t[1] + ' cm. ') + 'Melalui pendekatan ' + params.learningMethodName + ', panjang sisi miring c adalah ....',
      options: opts,
      correctIndex: 0,
      explanation: 'Teorema Pythagoras: c = √(' + t[0] + '² + ' + t[1] + '²) = ' + t[2] + ' cm.'
    };
  }

  if (lower.indexOf('ipa') !== -1 || lower.indexOf('fisika') !== -1 || lower.indexOf('biologi') !== -1 || lower.indexOf('kimia') !== -1) {
    var r1 = 4 + (seq % 3) * 2;
    var r2 = 6;
    var v = (r1 + r2) * 2;
    var svgSci = '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><rect x="75" y="48" width="250" height="125" fill="none" stroke="#1e3a8a" stroke-width="2.5"/><text x="200" y="42" text-anchor="middle" font-size="13" font-weight="700" fill="#1e3a8a">R₁=' + r1 + 'Ω · R₂=' + r2 + 'Ω (Seri)</text><text x="200" y="188" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">Tegangan V = ' + v + ' V</text></svg>';
    var optsSci = ['2 A', '1 A', '4 A', '6 A'];
    if (optCount === 5) optsSci.push('8 A');
    return {
      id: id,
      jenjang: params.jenjang,
      kelas: params.kelas,
      kurikulum: params.kurikulum,
      mapel: params.mapel,
      difficulty: diff,
      learningMethod: params.learningMethodName,
      topic: 'Rangkaian Listrik & Konsep Sains',
      hasImage: wantsImage,
      svgDiagram: wantsImage ? svgSci : '',
      prompt: (wantsImage ? 'Amati skema rangkaian seri pada gambar di atas. ' : '') + 'Dua hambatan R₁ = ' + r1 + ' Ω dan R₂ = ' + r2 + ' Ω dirangkai seri pada tegangan ' + v + ' V. Kuat arus yang mengalir adalah ....',
      options: optsSci,
      correctIndex: 0,
      explanation: 'Hambatan total R = ' + r1 + ' + ' + r2 + ' = ' + (r1 + r2) + ' Ω. Maka I = V / R = ' + v + ' / ' + (r1 + r2) + ' = 2 A.'
    };
  }

  var svgGen = '<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="220" fill="#f8fafc" rx="10"/><rect x="35" y="65" width="95" height="68" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="8"/><text x="82" y="102" text-anchor="middle" font-size="12" font-weight="700" fill="#1e3a8a">1. Fakta</text><rect x="152" y="65" width="95" height="68" fill="#dbeafe" stroke="#1e3a8a" stroke-width="2" rx="8"/><text x="200" y="102" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">2. Analisis</text><rect x="270" y="65" width="95" height="68" fill="#ecfdf5" stroke="#059669" stroke-width="2" rx="8"/><text x="317" y="102" text-anchor="middle" font-size="12" font-weight="700" fill="#065f46">3. Solusi</text></svg>';
  var optsGen = [
    'Menguji fakta secara objektif lalu menyusun simpulan logis',
    'Menarik kesimpulan tergesa-gesa tanpa memeriksa data',
    'Mengabaikan bukti pendukung yang berbeda pendapat',
    'Menyalin jawaban tanpa memahami alur materi'
  ];
  if (optCount === 5) optsGen.push('Menolak diskusi kelompok kelas');

  return {
    id: id,
    jenjang: params.jenjang,
    kelas: params.kelas,
    kurikulum: params.kurikulum,
    mapel: params.mapel,
    difficulty: diff,
    learningMethod: params.learningMethodName,
    topic: 'Kompetensi ' + params.mapel,
    hasImage: wantsImage,
    svgDiagram: wantsImage ? svgGen : '',
    prompt: (wantsImage ? 'Perhatikan diagram alur penalaran di atas. ' : '') + 'Dalam pembelajaran ' + params.mapel + ' (' + params.kelas + ' · ' + params.kurikulum + ') dengan metode ' + params.learningMethodName + ', langkah analisis yang paling tepat adalah ....',
    options: optsGen,
    correctIndex: 0,
    explanation: 'Pendekatan ' + params.learningMethodName + ' menuntut peserta didik mengumpulkan fakta valid, menganalisis konsep inti, lalu merumuskan simpulan terukur.'
  };
}

function generateExamQuestions(params) {
  ensureSheetsInitialized_();
  var sheet = getDb_().getSheetByName('Bank_Soal');
  var rows = sheet.getDataRange().getValues();
  var imgPool = [];
  var txtPool = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[8]) continue;
    var matchJenjang = !params.jenjang || String(r[1]) === params.jenjang;
    var matchMapel = !params.mapel || String(r[4]).toLowerCase().indexOf(params.mapel.toLowerCase()) !== -1;
    var matchDiff = params.difficulty === 'campuran' || String(r[5]) === params.difficulty;
    if (matchJenjang && matchMapel && matchDiff) {
      var media = String(r[12] || '');
      var hasImg = media.length > 0;
      var qObj = {
        id: String(r[0]),
        jenjang: String(r[1]),
        kelas: String(r[2]),
        kurikulum: String(r[3]),
        mapel: String(r[4]),
        difficulty: String(r[5]),
        learningMethod: String(r[6]),
        topic: String(r[7]),
        prompt: String(r[8]),
        options: JSON.parse(r[9] || '[]'),
        correctIndex: Number(r[10] || 0),
        explanation: String(r[11] || ''),
        hasImage: hasImg,
        svgDiagram: media.indexOf('<svg') !== -1 ? media : '',
        imageUrl: media.indexOf('http') === 0 ? media : ''
      };
      if (hasImg) imgPool.push(qObj);
      else txtPool.push(qObj);
    }
  }

  var total = Math.max(1, Math.min(50, Number(params.totalQuestions || 10)));
  var imgCount = Math.max(0, Math.min(total, Number(params.imageQuestionsCount || 0)));
  var txtCount = total - imgCount;

  var chosen = [];
  for (var a = 0; a < Math.min(imgCount, imgPool.length); a++) chosen.push(imgPool[a]);
  for (var b = 0; b < Math.min(txtCount, txtPool.length); b++) chosen.push(txtPool[b]);

  var needImg = imgCount - Math.min(imgCount, imgPool.length);
  var needTxt = txtCount - Math.min(txtCount, txtPool.length);
  var diffs = ['mudah', 'sedang', 'sulit'];

  for (var x = 0; x < needImg; x++) {
    var d1 = params.difficulty === 'campuran' ? diffs[x % 3] : params.difficulty;
    chosen.push(buildParametricGasQuestion_(params, true, x + 1, d1));
  }
  for (var y = 0; y < needTxt; y++) {
    var d2 = params.difficulty === 'campuran' ? diffs[(y + needImg) % 3] : params.difficulty;
    chosen.push(buildParametricGasQuestion_(params, false, needImg + y + 1, d2));
  }

  return chosen.slice(0, total);
}

function submitExamResult(payload) {
  ensureSheetsInitialized_();
  var sheet = getDb_().getSheetByName('Hasil_Ujian');
  var rowId = 'RES-' + new Date().getTime();
  sheet.appendRow([
    rowId,
    new Date().toISOString(),
    payload.studentName,
    payload.studentClass || '-',
    payload.schoolName || '-',
    payload.jenjang,
    payload.kurikulum,
    payload.mapel,
    payload.learningMethod,
    payload.difficulty,
    payload.mode === 'ujian' ? 'Simulasi Ujian' : 'Latihan Mandiri',
    payload.score,
    payload.correctCount + '/' + payload.totalQuestions
  ]);
  return { ok: true, id: rowId };
}
`;
}

export function generateGasIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nusantara CBT — Web App Mandiri Google Apps Script</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
    header { background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 800; font-size: 18px; color: #0f172a; }
    .wrap { max-width: 1020px; margin: 24px auto; padding: 0 16px; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    h1, h2, h3 { margin-top: 0; }
    label { display: block; font-weight: 600; font-size: 13px; margin-top: 14px; color: #334155; }
    input, select, textarea { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; margin-top: 5px; font-size: 14px; }
    .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    button { background: #1e3a8a; color: #fff; border: 0; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
    button.sec { background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; }
    button.ok { background: #047857; }
    .hidden { display: none; }
    .opt { display: flex; gap: 10px; align-items: flex-start; border: 1px solid #cbd5e1; padding: 12px; border-radius: 10px; margin-top: 10px; cursor: pointer; background: #fff; text-align: left; width: 100%; color: #0f172a; }
    .opt.active { border-color: #1e3a8a; background: #eff6ff; }
    .navgrid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 12px; }
    .qbtn { padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #0f172a; font-family: monospace; font-weight: 700; cursor: pointer; }
    .qbtn.ans { background: #ecfdf5; border-color: #34d399; color: #065f46; }
    .qbtn.cur { background: #1e3a8a; border-color: #1e3a8a; color: #fff; }
    .alert { border: 1px solid #fcd34d; background: #fffbeb; color: #78350f; padding: 12px; border-radius: 10px; margin-bottom: 14px; font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <div class="brand" id="portalBrand">Nusantara CBT</div>
    <div>
      <button class="sec" onclick="openAdminGate()">Dashboard Admin</button>
    </div>
  </header>

  <div class="wrap">
    <!-- VIEW 1: SETUP -->
    <div id="setupView" class="card">
      <h2>Simulasi Ujian &amp; Latihan Mandiri (100% Google Apps Script)</h2>
      <div class="grid2">
        <div>
          <label>Nama Peserta Didik * (Wajib Diisi)</label>
          <input id="studentName" type="text" placeholder="Masukkan nama lengkap siswa" />
        </div>
        <div>
          <label>Mode Simulasi</label>
          <select id="simMode">
            <option value="ujian">Simulasi Ujian Resmi (Timer)</option>
            <option value="latihan">Latihan Mandiri (Cek Jawaban Langsung)</option>
          </select>
        </div>
        <div>
          <label>Jenjang Pendidikan</label>
          <select id="jenjang" onchange="syncSubjects()">
            <option value="SD">SD</option>
            <option value="SMP" selected>SMP</option>
            <option value="SMA">SMA</option>
          </select>
        </div>
        <div>
          <label>Kurikulum</label>
          <select id="kurikulum">
            <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
            <option value="Kurikulum 2013">Kurikulum 2013</option>
          </select>
        </div>
        <div>
          <label>Mata Pelajaran</label>
          <select id="mapel"></select>
        </div>
        <div>
          <label>Metode Pembelajaran</label>
          <select id="learningMethod">
            <optgroup label="Pembelajaran Utama & Populer">
              <option>Problem-Based Learning (PBL)</option>
              <option>Project-Based Learning (PjBL)</option>
              <option>Discovery & Inquiry Learning</option>
              <option>Cooperative Learning</option>
              <option>Drill & Practice</option>
            </optgroup>
            <optgroup label="Metode Inovatif & Berbasis Tren">
              <option>HOTS & Literasi-Numerasi (AKM/ANBK)</option>
              <option>STEM / STEAM Terintegrasi</option>
              <option>Gamifikasi Edukatif</option>
              <option>Flipped Classroom</option>
              <option>Blended Learning</option>
            </optgroup>
            <optgroup label="Pendekatan Khusus Karakteristik Sekolah">
              <option>Pembelajaran Berdiferensiasi</option>
              <option>Sekolah Adiwiyata (Berbasis Lingkungan)</option>
              <option>Sekolah Ramah Anak & Inklusif</option>
              <option>Sekolah Berbasis Karakter Religius</option>
              <option>Sekolah 3T & Kearifan Lokal</option>
            </optgroup>
          </select>
        </div>
        <div>
          <label>Jumlah Soal (Isi Manual)</label>
          <input id="totalQuestions" type="number" min="1" max="50" value="5" />
        </div>
        <div>
          <label>Jumlah Soal dengan Gambar/SVG</label>
          <input id="imageCount" type="number" min="0" max="50" value="2" />
        </div>
        <div>
          <label>Tingkat Kesulitan</label>
          <select id="difficulty">
            <option value="campuran">Campuran</option>
            <option value="mudah">Mudah</option>
            <option value="sedang">Sedang</option>
            <option value="sulit">Sulit</option>
          </select>
        </div>
        <div>
          <label>Setting Timer (Menit)</label>
          <input id="durationMinutes" type="number" min="1" max="180" value="30" />
        </div>
      </div>
      <div style="margin-top:20px;">
        <button onclick="startExam()">Generate Soal &amp; Mulai Simulasi</button>
      </div>
    </div>

    <!-- VIEW 2: EXAM -->
    <div id="examView" class="hidden">
      <div class="card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <strong id="examTitle"></strong>
          <div id="examMeta" style="font-size:12px;color:#64748b;"></div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span id="timerText" style="font-family:monospace;font-weight:800;font-size:16px;padding:6px 12px;border:1px solid #cbd5e1;border-radius:8px;"></span>
          <button class="sec" onclick="requestPinUnlock()">Beranda / Generate Baru (PIN Admin)</button>
        </div>
      </div>

      <div id="missingBanner" class="alert hidden"></div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
        <div class="card">
          <div id="qHeader" style="font-size:13px;font-weight:700;color:#1e3a8a;"></div>
          <div id="qMedia" style="margin:12px 0;"></div>
          <p id="qPrompt" style="font-size:15px;line-height:1.6;"></p>
          <div id="qOptions"></div>
          <div id="practiceFeedback" class="hidden" style="margin-top:14px;padding:12px;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;"></div>
          <div style="margin-top:18px;display:flex;justify-content:space-between;gap:8px;">
            <button class="sec" onclick="prevQ()">Sebelumnya</button>
            <button id="practiceBtn" class="sec hidden" onclick="checkPractice()">Periksa Jawaban</button>
            <button id="nextBtn" onclick="nextQ()">Selanjutnya</button>
          </div>
        </div>

        <div class="card">
          <strong>Navigasi Soal</strong>
          <div id="navGrid" class="navgrid"></div>
          <button class="ok" style="width:100%;margin-top:16px;" onclick="attemptFinish()">Selesai &amp; Kumpulkan</button>
        </div>
      </div>
    </div>

    <!-- VIEW 3: RESULT -->
    <div id="resultView" class="hidden card">
      <h2 id="resScore"></h2>
      <p id="resSummary"></p>
      <div style="margin:16px 0;">
        <button class="sec" onclick="requestPinUnlock()">Generate Baru / Beranda (PIN Admin)</button>
      </div>
      <h3>Pembahasan Soal yang Salah</h3>
      <div id="wrongList"></div>
    </div>

    <!-- VIEW 4: ADMIN -->
    <div id="adminView" class="hidden card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2>Dashboard Administrator</h2>
        <button class="sec" onclick="closeAdmin()">Tutup Admin</button>
      </div>
      <div id="adminBody"></div>
    </div>
  </div>

  <script>
    var SUBJECTS = {
      SD: ['Pendidikan Agama & Budi Pekerti','Pendidikan Pancasila / PPKn','Bahasa Indonesia','Matematika','IPAS','Bahasa Inggris','SBdP','PJOK','Muatan Lokal'],
      SMP: ['Pendidikan Agama & Budi Pekerti','Pendidikan Pancasila / PPKn','Bahasa Indonesia','Matematika','IPA Terpadu','IPS Terpadu','Bahasa Inggris','Informatika','Seni Budaya','Prakarya','PJOK'],
      SMA: ['Pendidikan Agama & Budi Pekerti','Pendidikan Pancasila / PPKn','Bahasa Indonesia','Bahasa Inggris','Matematika Wajib','Matematika Tingkat Lanjut','Fisika','Kimia','Biologi','Ekonomi & Akuntansi','Geografi','Sosiologi','Sejarah','Antropologi','Informatika','Seni Budaya','PKWU','PJOK']
    };

    var questions = [];
    var answers = {};
    var activeIdx = 0;
    var remainingSec = 1800;
    var timerHandle = null;
    var isLocked = false;
    var currentMode = 'ujian';
    var kkm = 75;

    function syncSubjects() {
      var j = document.getElementById('jenjang').value;
      var sel = document.getElementById('mapel');
      sel.innerHTML = SUBJECTS[j].map(function (s) { return '<option>' + s + '</option>'; }).join('');
    }
    syncSubjects();

    google.script.run.withSuccessHandler(function (cfg) {
      if (!cfg) return;
      document.getElementById('portalBrand').textContent = cfg.schoolTitle || 'Nusantara CBT';
      document.getElementById('durationMinutes').value = cfg.durasiDefault || 30;
      kkm = cfg.kkmDefault || 75;
    }).getPublicConfig();

    function startExam() {
      var name = document.getElementById('studentName').value.trim();
      if (!name) { alert('Nama peserta didik wajib diisi!'); return; }
      currentMode = document.getElementById('simMode').value;
      var dur = Math.max(1, Number(document.getElementById('durationMinutes').value) || 30);
      var params = {
        studentName: name,
        jenjang: document.getElementById('jenjang').value,
        kelas: 'Kelas ' + document.getElementById('jenjang').value,
        kurikulum: document.getElementById('kurikulum').value,
        mapel: document.getElementById('mapel').value,
        learningMethodName: document.getElementById('learningMethod').value,
        totalQuestions: Number(document.getElementById('totalQuestions').value) || 5,
        imageQuestionsCount: Number(document.getElementById('imageCount').value) || 0,
        difficulty: document.getElementById('difficulty').value
      };

      google.script.run.withSuccessHandler(function (qs) {
        questions = qs || [];
        answers = {};
        activeIdx = 0;
        isLocked = true;
        remainingSec = dur * 60;
        document.getElementById('setupView').classList.add('hidden');
        document.getElementById('resultView').classList.add('hidden');
        document.getElementById('examView').classList.remove('hidden');
        document.getElementById('examTitle').textContent = params.mapel + ' — ' + name;
        document.getElementById('examMeta').textContent = params.jenjang + ' · ' + params.kurikulum + ' · ' + params.learningMethodName;
        startTimer();
        renderQuestion();
      }).generateExamQuestions(params);
    }

    function startTimer() {
      if (timerHandle) clearInterval(timerHandle);
      timerHandle = setInterval(function () {
        remainingSec = Math.max(0, remainingSec - 1);
        var m = Math.floor(remainingSec / 60), s = remainingSec % 60;
        document.getElementById('timerText').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        if (remainingSec === 0 && currentMode === 'ujian') {
          clearInterval(timerHandle);
          submitResults();
        }
      }, 1000);
    }

    function renderQuestion() {
      var q = questions[activeIdx];
      if (!q) return;
      document.getElementById('qHeader').textContent = 'Soal ' + (activeIdx + 1) + ' dari ' + questions.length + ' · Tingkat: ' + q.difficulty;
      document.getElementById('qMedia').innerHTML = q.svgDiagram ? q.svgDiagram : (q.imageUrl ? '<img src="' + q.imageUrl + '" style="max-width:100%;border-radius:8px;" />' : '');
      document.getElementById('qPrompt').textContent = q.prompt;
      document.getElementById('practiceFeedback').classList.add('hidden');
      document.getElementById('practiceBtn').classList.toggle('hidden', currentMode !== 'latihan');
      document.getElementById('nextBtn').textContent = activeIdx === questions.length - 1 ? 'Selesai & Kumpulkan' : 'Selanjutnya';

      var optsHtml = q.options.map(function (o, i) {
        var cls = answers[activeIdx] === i ? 'opt active' : 'opt';
        return '<button class="' + cls + '" onclick="pickOpt(' + i + ')"><strong>' + String.fromCharCode(65 + i) + '.</strong> <span>' + o + '</span></button>';
      }).join('');
      document.getElementById('qOptions').innerHTML = optsHtml;

      var navHtml = questions.map(function (_, idx) {
        var c = idx === activeIdx ? 'qbtn cur' : (answers[idx] !== undefined ? 'qbtn ans' : 'qbtn');
        return '<button class="' + c + '" onclick="jumpQ(' + idx + ')">' + (idx + 1) + '</button>';
      }).join('');
      document.getElementById('navGrid').innerHTML = navHtml;
    }

    function pickOpt(i) { answers[activeIdx] = i; renderQuestion(); }
    function jumpQ(i) { activeIdx = i; renderQuestion(); }
    function prevQ() { if (activeIdx > 0) { activeIdx--; renderQuestion(); } }
    function nextQ() {
      if (activeIdx < questions.length - 1) { activeIdx++; renderQuestion(); }
      else attemptFinish();
    }

    function checkPractice() {
      var q = questions[activeIdx];
      var sel = answers[activeIdx];
      if (sel === undefined) return;
      var fb = document.getElementById('practiceFeedback');
      fb.classList.remove('hidden');
      fb.innerHTML = '<strong>' + (sel === q.correctIndex ? 'Benar!' : 'Kurang tepat. Kunci: ' + String.fromCharCode(65 + q.correctIndex)) + '</strong><p style="margin:6px 0 0;">' + q.explanation + '</p>';
    }

    function attemptFinish() {
      var missing = [];
      for (var i = 0; i < questions.length; i++) {
        if (answers[i] === undefined) missing.push(i);
      }
      if (missing.length > 0) {
        var b = document.getElementById('missingBanner');
        b.classList.remove('hidden');
        b.textContent = 'Masih ada soal belum dijawab (Nomor: ' + missing.map(function (x) { return x + 1; }).join(', ') + '). Anda diarahkan ke soal nomor ' + (missing[0] + 1) + '.';
        activeIdx = missing[0];
        renderQuestion();
        return;
      }
      document.getElementById('missingBanner').classList.add('hidden');
      submitResults();
    }

    function submitResults() {
      if (timerHandle) clearInterval(timerHandle);
      var correct = 0;
      var wrongHtml = '';
      questions.forEach(function (q, i) {
        if (answers[i] === q.correctIndex) correct++;
        else {
          wrongHtml += '<div style="border:1px solid #e2e8f0;padding:12px;border-radius:8px;margin-bottom:10px;"><strong>Nomor ' + (i + 1) + ':</strong> ' + q.prompt + '<br/><span style="color:#dc2626;">Jawaban Anda: ' + (answers[i] !== undefined ? q.options[answers[i]] : 'Kosong') + '</span><br/><span style="color:#047857;">Kunci: ' + q.options[q.correctIndex] + '</span><p style="margin:6px 0 0;color:#334155;">' + q.explanation + '</p></div>';
        }
      });
      var score = Math.round((correct / questions.length) * 100);
      document.getElementById('examView').classList.add('hidden');
      document.getElementById('resultView').classList.remove('hidden');
      document.getElementById('resScore').textContent = 'Nilai Akhir: ' + score + ' (' + (score >= kkm ? 'Tuntas KKM' : 'Perlu Penguatan') + ')';
      document.getElementById('resSummary').textContent = 'Benar ' + correct + ' dari ' + questions.length + ' soal.';
      document.getElementById('wrongList').innerHTML = wrongHtml || '<p>Sempurna! Semua soal dijawab benar.</p>';

      google.script.run.submitExamResult({
        studentName: document.getElementById('studentName').value.trim(),
        jenjang: document.getElementById('jenjang').value,
        kurikulum: document.getElementById('kurikulum').value,
        mapel: document.getElementById('mapel').value,
        learningMethod: document.getElementById('learningMethod').value,
        difficulty: document.getElementById('difficulty').value,
        mode: currentMode,
        score: score,
        correctCount: correct,
        totalQuestions: questions.length
      });
    }

    function requestPinUnlock() {
      var pin = prompt('Masukkan PIN Admin untuk membuka kunci sesi:');
      if (!pin) return;
      google.script.run.withSuccessHandler(function (ok) {
        if (!ok) { alert('PIN Admin tidak sesuai.'); return; }
        if (timerHandle) clearInterval(timerHandle);
        isLocked = false;
        document.getElementById('examView').classList.add('hidden');
        document.getElementById('resultView').classList.add('hidden');
        document.getElementById('setupView').classList.remove('hidden');
      }).verifyAdminPin(pin);
    }

    function openAdminGate() {
      var pwd = prompt('Masukkan Password Administrator:');
      if (!pwd) return;
      google.script.run.withSuccessHandler(function (data) {
        document.getElementById('setupView').classList.add('hidden');
        document.getElementById('examView').classList.add('hidden');
        document.getElementById('resultView').classList.add('hidden');
        document.getElementById('adminView').classList.remove('hidden');
        var rows = data.results.map(function (r) {
          return '<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0;">' + r.studentName + '</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">' + r.mapel + '</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">' + r.score + '</td></tr>';
        }).join('');
        document.getElementById('adminBody').innerHTML =
          '<p>PIN Buka Kunci saat ini: <strong>' + data.config.unlockPin + '</strong> · KKM: <strong>' + data.config.kkmDefault + '</strong> · Bank Soal: <strong>' + data.bank.length + '</strong></p>' +
          '<h3>Rekap Nilai Terbaru</h3><table style="width:100%;border-collapse:collapse;"><tr><th align="left">Nama</th><th align="left">Mapel</th><th align="left">Nilai</th></tr>' + rows + '</table>';
      }).withFailureHandler(function (err) {
        alert(err.message);
      }).getAdminDashboardData(pwd);
    }

    function closeAdmin() {
      document.getElementById('adminView').classList.add('hidden');
      if (isLocked) document.getElementById('examView').classList.remove('hidden');
      else document.getElementById('setupView').classList.remove('hidden');
    }
  </script>
</body>
</html>
`;
}
