(function () {
  'use strict';

  /* ================= Utilitas ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s =>
    String(s).replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
    );
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const NS = 'http://www.w3.org/2000/svg';
  function store(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  }
  function load(k, d) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function pct(p) {
    const v = p * 100;
    return (v >= 1 ? v.toFixed(1) : v.toFixed(2)).replace('.', ',') + '%';
  }

  /* ================= Kamus istilah untuk pemula ================= */
  /* Kata/istilah teknis di bawah ini otomatis diberi garis putus-putus.
   Sentuh atau arahkan kursor ke kata itu untuk melihat penjelasan sederhana. */
  const GLOSSARY = {
    'ARP spoofing':
      'Trik penyerang berpura-pura menjadi perangkat lain di jaringan yang sama, supaya data yang seharusnya dikirim ke perangkat itu malah lewat perangkat penyerang dulu.',
    'man-in-the-middle':
      'Penyerang menyelinap di tengah "percakapan" dua perangkat, sehingga bisa menyadap atau mengubah data yang lewat tanpa disadari kedua pihak.',
    'Dynamic ARP Inspection':
      'Fitur di switch yang memeriksa setiap pesan ARP dan otomatis membuang yang mencurigakan, sebelum sempat menipu perangkat lain.',
    DAI: 'Singkatan dari Dynamic ARP Inspection: fitur switch yang memeriksa dan membuang pesan ARP palsu.',
    'DHCP snooping':
      'Pengaturan di switch supaya hanya server pembagi alamat IP (DHCP) yang resmi boleh bekerja; tawaran dari perangkat lain otomatis ditolak.',
    DHCP: 'Layanan yang otomatis membagikan alamat IP ke perangkat yang baru terhubung ke jaringan, mirip resepsionis yang memberi nomor kamar ke tamu baru.',
    rogue:
      'Perangkat atau layanan liar/tidak resmi yang dipasang tanpa izin, biasanya untuk menipu pengguna lain di jaringan yang sama.',
    NAC: 'Network Access Control: sistem yang memeriksa identitas sebuah perangkat dulu sebelum mengizinkannya masuk ke jaringan.',
    '802.1X':
      'Standar yang mewajibkan perangkat "login" (memverifikasi identitas) dulu sebelum boleh memakai jaringan, mirip mengecek kartu tanda pengenal sebelum masuk gedung.',
    RADIUS:
      'Server pusat yang tugasnya memeriksa nama pengguna dan kata sandi saat ada perangkat yang mencoba masuk ke jaringan atau Wi-Fi.',
    'WPA2-Enterprise':
      'Jenis keamanan Wi-Fi yang mewajibkan setiap orang login pakai akun pribadi (bukan satu kata sandi yang dipakai bersama), lebih aman untuk kampus atau kantor.',
    'WPA2/WPA3-Enterprise':
      'Jenis keamanan Wi-Fi yang mewajibkan setiap orang login pakai akun pribadi (bukan satu kata sandi yang dipakai bersama), lebih aman untuk kampus atau kantor.',
    'evil twin':
      'Titik akses Wi-Fi palsu yang meniru nama jaringan asli, supaya perangkat orang lain tersambung tanpa sadar ke jaringan milik penyerang.',
    'Wireless IPS':
      'Sistem yang otomatis mendeteksi titik akses Wi-Fi palsu di sekitar gedung, lalu memutus koneksi ke sana.',
    WIPS: 'Singkatan dari Wireless IPS: sistem yang otomatis mendeteksi dan memutus titik akses Wi-Fi palsu.',
    SSID: 'Nama jaringan Wi-Fi yang muncul saat kamu mencari Wi-Fi di HP atau laptop.',
    BSSID:
      '"Nomor mesin" unik milik satu perangkat pemancar Wi-Fi, berbeda dari SSID yang cuma nama jaringan dan bisa ditiru siapa saja.',
    TLS: 'Teknologi yang mengacak (mengenkripsi) data supaya orang lain di tengah jalur tidak bisa membacanya; inilah yang membuat HTTPS aman.',
    HTTPS:
      'Versi aman dari HTTP: data antara browser dan situs web sudah diacak (dienkripsi) sehingga sulit disadap orang lain.',
    HTTP: 'Cara standar browser dan situs web bertukar data. Versi ini TIDAK diacak/dienkripsi, jadi isinya bisa dibaca orang lain yang menyadap jalurnya.',
    ciphertext:
      'Data yang sudah diacak lewat enkripsi, sehingga tidak bisa dibaca tanpa kunci untuk membukanya.',
    VPN: 'Semacam terowongan pribadi dan terenkripsi lewat internet, sehingga aktivitas online lebih sulit disadap pihak lain.',
    phishing:
      'Penipuan lewat email atau pesan yang menyamar sebagai pihak resmi, untuk memancing korban memberi kata sandi atau data pribadi.',
    vishing:
      'Penipuan lewat telepon; pelaku berpura-pura jadi petugas resmi supaya korban mau memberi data rahasia.',
    'social engineering':
      'Trik menipu atau membujuk ORANG (bukan membobol sistem) supaya secara sukarela memberi akses atau informasi rahasia.',
    'business email compromise':
      'Penipuan lewat email yang berpura-pura jadi atasan atau vendor, untuk membujuk korban mentransfer uang ke rekening penipu.',
    SPF: 'Catatan di server email yang menandai server mana saja yang boleh mengirim email atas nama sebuah domain (nama perusahaan/kampus).',
    DKIM: 'Tanda tangan digital pada email yang membuktikan isi pesan tidak diubah selama proses pengiriman.',
    DMARC:
      'Aturan yang memberi tahu penerima email apa yang harus dilakukan kalau sebuah email gagal lolos pemeriksaan SPF atau DKIM.',
    malware:
      'Program jahat yang dirancang untuk merusak perangkat, mencuri data, atau mengambil alih kendali sistem.',
    ransomware:
      'Jenis program jahat yang mengunci atau mengacak file korban, lalu pelakunya minta uang tebusan supaya file bisa dibuka lagi.',
    DDoS: 'Serangan yang membanjiri sebuah layanan dengan jutaan permintaan palsu sekaligus, sampai layanan itu tidak bisa dipakai pengguna yang asli.',
    DLP: 'Data Loss Prevention: sistem yang otomatis mendeteksi dan mencegah data penting bocor keluar dari organisasi.',
    SIEM: 'Sistem yang mengumpulkan dan menganalisis catatan aktivitas (log) dari banyak perangkat, lalu memberi peringatan kalau ada yang mencurigakan.',
    SOC: 'Security Operations Center: tim yang tugasnya memantau dan menanggapi ancaman keamanan sepanjang waktu.',
    EDR: 'Program pelindung di laptop/komputer yang memantau perilaku mencurigakan dan bisa langsung bertindak menghentikannya.',
    'segmentasi jaringan':
      'Membagi jaringan besar menjadi beberapa bagian yang terpisah, supaya kalau satu bagian diserang, bagian lain tetap aman.',
    'least-privilege':
      'Prinsip memberi setiap orang atau sistem hak akses sekecil mungkin, cukup untuk tugasnya saja, tidak lebih.',
    'least privilege':
      'Prinsip memberi setiap orang atau sistem hak akses sekecil mungkin, cukup untuk tugasnya saja, tidak lebih.',
    'autentikasi multi-faktor':
      'Cara login yang mewajibkan lebih dari satu bukti identitas, misalnya kata sandi ditambah kode dari HP, supaya akun tidak gampang dibobol walau kata sandi bocor.',
    'lateral movement':
      'Setelah berhasil masuk ke satu komputer, penyerang diam-diam bergerak ke komputer atau server lain di jaringan yang sama.',
    eksfiltrasi:
      'Proses penyerang mengirim data curian keluar dari jaringan korban menuju server milik mereka sendiri.',
    kredensial: 'Data untuk login, misalnya nama pengguna dan kata sandi.',
    endpoint:
      'Perangkat pengguna akhir yang terhubung ke jaringan, misalnya laptop, komputer, atau HP.',
    containment:
      'Tindakan mengisolasi atau membatasi ruang gerak sebuah ancaman, supaya tidak menyebar lebih luas ke bagian jaringan lain.',
    'IP Source Guard':
      'Fitur switch yang memeriksa apakah alamat IP pengirim sesuai dengan data yang tercatat, untuk mencegah pemalsuan alamat IP.',
    sertifikat:
      'Semacam "kartu identitas digital" milik server yang membuktikan server itu benar-benar pihak resmi, bukan tiruan.',
    CA: 'Certificate Authority: lembaga tepercaya yang menerbitkan "kartu identitas digital" (sertifikat) untuk server, supaya keasliannya bisa dibuktikan.',
    'change management':
      'Proses resmi untuk mencatat, meninjau, dan menyetujui setiap perubahan pada sistem, supaya perubahan tidak dilakukan diam-diam.',
    hash: '"Sidik jari" digital dari sebuah berkas: kalau isi berkas berubah sedikit saja, hasil hash-nya ikut berubah, jadi bisa dipakai mengecek keasliannya.',
    'rate limiting':
      'Membatasi jumlah permintaan yang boleh masuk dalam waktu tertentu, supaya server tidak kebanjiran permintaan palsu.',
    scrubbing:
      'Layanan pihak ketiga yang menyaring lalu lintas mencurigakan sebelum sampai ke server asli, biasa dipakai melawan serangan DDoS.',
    CDN: 'Content Delivery Network: jaringan server di banyak lokasi yang membuat sebuah situs web tetap cepat diakses dan tahan lonjakan pengunjung.',
    'single point of failure':
      'Satu bagian penting yang kalau rusak atau putus, seluruh sistem ikut berhenti karena tidak ada cadangannya.',
    'SD-WAN':
      'Teknologi yang mengatur beberapa jalur internet sekaligus secara otomatis, sehingga bisa langsung pindah jalur kalau salah satu putus.',
    'double extortion':
      'Taktik ransomware ganda: selain mengunci file korban, pelaku juga mengancam menyebarkan data curian kalau tebusan tidak dibayar.',
    'data breach':
      'Kebocoran data: informasi rahasia (misalnya data pribadi) jatuh ke tangan pihak yang tidak berhak melihatnya.',
    'Denial of Service':
      'Serangan yang membuat sebuah layanan tidak bisa dipakai, biasanya dengan membanjirinya dengan permintaan palsu dalam jumlah sangat besar.',
    'defense in depth':
      'Strategi memasang beberapa lapis pertahanan sekaligus (bukan cuma satu), supaya kalau satu lapisan jebol, lapisan lain masih menahan serangan.',
    'titik kegagalan tunggal':
      'Satu bagian penting yang kalau rusak atau putus, seluruh sistem ikut berhenti karena tidak ada cadangannya.'
  };
  const GLOSS_RE = (() => {
    const keys = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    const esc2 = s => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    return new RegExp('\\b(' + keys.map(esc2).join('|') + ')\\b', 'gi');
  })();
  function G(text) {
    if (text == null) return '';
    const safe = esc(text);
    return safe.replace(GLOSS_RE, m => {
      const key = Object.keys(GLOSSARY).find(k => k.toLowerCase() === m.toLowerCase()) || m;
      const def = GLOSSARY[key] || '';
      return `<span class="term" tabindex="0">${m}<span class="term-tip" role="tooltip">${esc(def)}</span></span>`;
    });
  }

  /* ================= Tema ================= */
  const root = document.documentElement;
  const savedTheme = load('tc751.theme', null);
  if (savedTheme === 'dark' || savedTheme === 'light') root.setAttribute('data-theme', savedTheme);
  $('#themeBtn').addEventListener('click', () => {
    const cur =
      root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('tc751.theme', next);
  });

  /* ================= Status kemajuan ================= */
  const P = {
    lab1: { done: false, score: 0, total: 8 },
    lab2: {
      arp: { bad: false, good: false, last: null },
      dhcp: { bad: false, good: false, last: null },
      evil: { bad: false, good: false, last: null },
      ddos: { bad: false, good: false, last: null },
      imp: { bad: false, good: false, last: null }
    },
    lab3: { emails: {}, defense: { ok: false, risk: null, worst: null, cost: 0, layers: [] } }
  };
  const LABS = [
    { id: 'lab1', name: 'Triad CIA dan klasifikasi ancaman' },
    { id: 'spoof', name: 'Spoofing dan rogue system' },
    { id: 'ddos', name: 'Serangan DDoS' },
    { id: 'imp', name: 'Impersonation (MAC spoofing)' },
    { id: 'lab3', name: 'Social engineering dan pertahanan berlapis' }
  ];
  function labStatus(id) {
    if (id === 'lab1')
      return {
        done: P.lab1.done,
        text: P.lab1.done ? `Selesai, skor ${P.lab1.score}/${P.lab1.total}` : 'Belum dikerjakan'
      };
    if (SIMLABS[id]) {
      const L = SIMLABS[id].list,
        n = L.filter(k => P.lab2[k].bad && P.lab2[k].good).length,
        tot = L.length;
      return {
        done: n === tot,
        text: n === tot ? `Selesai, ${tot} skenario` : `${n} dari ${tot} skenario tuntas`
      };
    }
    if (id === 'lab3') {
      const e = Object.keys(P.lab3.emails).length;
      const d = P.lab3.defense.ok;
      return {
        done: e === 3 && d,
        text:
          e === 3 && d ? 'Selesai' : `Email ${e}/3, target pertahanan ${d ? 'tercapai' : 'belum'}`
      };
    }
    return { done: false, text: '' };
  }
  function renderNav(active) {
    $('#nav').innerHTML = LABS.map(l => {
      const s = labStatus(l.id);
      return `<button type="button" data-lab="${l.id}" class="${s.done ? 'done' : ''}" ${l.id === active ? 'aria-current="page"' : ''}>
      <span class="n-name">${l.name}</span>${s.done ? '<span class="n-stat">Selesai</span>' : ''}</button>`;
    }).join('');
  }
  let currentLab = 'lab1',
    simLab = null;
  function showLab(id) {
    currentLab = id;
    /* Spoofing/rogue, DDoS, dan Impersonation memakai satu simulator yang sama; isinya dimuat ulang saat berpindah. */
    if (SIMLABS[id] && simLab !== id) renderLab2(id);
    const sec = SIMLABS[id] ? 'lab2' : id;
    ['lab1', 'lab2', 'lab3'].forEach(k => {
      $('#' + k).hidden = k !== sec;
    });
    renderNav(id);
    window.scrollTo(0, 0);
  }
  $('#nav').addEventListener('click', e => {
    const b = e.target.closest('button[data-lab]');
    if (b) showLab(b.dataset.lab);
  });
  function touchProgress() {
    renderNav(currentLab);
  }

  function labHead(title, indikator, intro) {
    return `<header class="lab-head"><h2>${title}</h2><p class="intro">${G(intro)}</p><details class="ind-d"><summary>Tujuan belajar (Indikator RPS)</summary><p>${G(indikator)}</p></details></header>`;
  }

  /* ================= LAB 1: Triad CIA ================= */
  const CIA = [
    {
      k: 'C',
      n: 'Confidentiality',
      d: 'Kerahasiaan',
      h: 'hanya pihak berwenang yang dapat membaca'
    },
    { k: 'I', n: 'Integrity', d: 'Integritas', h: 'data tidak berubah tanpa izin' },
    { k: 'A', n: 'Availability', d: 'Ketersediaan', h: 'layanan dan data ada saat dibutuhkan' }
  ];
  const QS = [
    {
      t: 'Seorang peretas menyalin basis data nilai mahasiswa lalu menyebarkannya di sebuah forum.',
      a: 'C',
      type: 'Pencurian data (data breach)',
      ctl: 'Enkripsi data, kontrol akses least-privilege, DLP.',
      why: 'Informasi jatuh ke pihak yang tidak berwenang. Yang dilanggar adalah kerahasiaan.'
    },
    {
      t: 'Penyerang mengubah nomor rekening tujuan pada berkas pembayaran sebelum berkas itu diproses bagian keuangan.',
      a: 'I',
      type: 'Modifikasi data tanpa izin',
      ctl: 'Tanda tangan digital atau hash, change management, validasi dua pihak.',
      why: 'Data tetap tersedia dan tidak bocor, tetapi isinya berubah tanpa izin. Yang dilanggar adalah integritas.'
    },
    {
      t: 'Portal KRS tidak dapat dibuka pada hari pengisian karena jutaan permintaan palsu membanjiri server.',
      a: 'A',
      type: 'Denial of Service terdistribusi (DDoS)',
      ctl: 'Rate limiting, scrubbing atau CDN, redundansi server.',
      why: 'Pengguna sah tidak dapat memakai layanan saat mereka membutuhkannya. Yang dilanggar adalah ketersediaan.'
    },
    {
      t: 'Laptop dosen berisi naskah soal ujian hilang di bandara, dan disk laptop itu tidak dienkripsi.',
      a: 'C',
      type: 'Kehilangan atau pencurian perangkat fisik',
      ctl: 'Enkripsi disk penuh, remote wipe, kebijakan perangkat bergerak.',
      why: 'Siapa pun yang menemukan laptop dapat membaca isinya. Risiko utamanya adalah kerahasiaan.'
    },
    {
      t: 'Ransomware mengenkripsi seluruh server berkas fakultas dan pelaku meminta tebusan.',
      a: 'A',
      type: 'Malware (ransomware)',
      ctl: 'Backup offline yang diuji, segmentasi, perlindungan endpoint.',
      why: 'Berkas tidak dapat diakses sehingga kegiatan berhenti: dampak utama pada ketersediaan. Jika pelaku juga mencuri data (double extortion), kerahasiaan ikut terlanggar. Satu insiden bisa mengenai lebih dari satu pilar.'
    },
    {
      t: 'Serangan man-in-the-middle menyisipkan skrip berbahaya ke halaman unduhan yang dibuka pengguna lewat HTTP.',
      a: 'I',
      type: 'Man-in-the-middle',
      ctl: 'HTTPS/TLS, HSTS, verifikasi checksum atau tanda tangan berkas.',
      why: 'Isi yang diterima pengguna berbeda dari isi yang dikirim server. Yang dilanggar adalah integritas.'
    },
    {
      t: 'Seorang penelepon yang mengaku teknisi TI membujuk staf menyebutkan kata sandi VPN miliknya.',
      a: 'C',
      type: 'Social engineering (vishing)',
      ctl: 'Pelatihan kesadaran, prosedur verifikasi identitas, autentikasi multi-faktor.',
      why: 'Kredensial rahasia berpindah ke pihak yang tidak berwenang. Pilar utama yang terlanggar adalah kerahasiaan.'
    },
    {
      t: 'Satu-satunya kabel uplink kampus terputus akibat galian, dan tidak ada jalur cadangan ke penyedia layanan internet.',
      a: 'A',
      type: 'Titik kegagalan tunggal (single point of failure)',
      ctl: 'Uplink ganda atau ISP ganda, SD-WAN, rencana kontinuitas layanan.',
      why: 'Layanan tidak tersedia meski tidak ada data yang bocor atau berubah. Yang terdampak adalah ketersediaan.'
    }
  ];
  let L1 = { order: [], i: 0, score: 0, sel: null };
  function initL1() {
    L1 = { order: shuffle(QS.map((_, i) => i)), i: 0, score: 0, sel: null };
  }
  function renderLab1() {
    $('#lab1').innerHTML =
      labHead(
        'Triad CIA dan klasifikasi ancaman',
        'Menganalisis konsep keamanan jaringan dan mengidentifikasi ancaman pada infrastruktur skala industri.',
        'Baca setiap insiden, lalu pilih pilar CIA yang paling utama terlanggar.'
      ) +
      '<p class="help-note">💡 <span><b>Baru belajar keamanan jaringan?</b> Kata dengan garis putus-putus (seperti <span class="term" tabindex="0">contoh<span class="term-tip" role="tooltip">Sentuh atau arahkan kursor ke kata bergaris putus-putus untuk melihat penjelasan sederhananya.</span></span>) punya penjelasan sederhana. Sentuh atau arahkan kursor ke kata itu kapan saja Anda menemukan istilah asing.</span></p>' +
      '<div class="panel" id="l1body" style="margin-top:28px"></div>';
    initL1();
    drawL1();
  }
  function drawL1() {
    const b = $('#l1body');
    if (L1.i >= L1.order.length) {
      P.lab1 = { done: true, score: L1.score, total: L1.order.length };
      touchProgress();
      const r = L1.score / L1.order.length;
      const msg =
        r >= 0.85
          ? 'Pemahaman Anda tentang triad CIA sudah kuat. Lanjutkan ke simulasi serangan pada bagian berikutnya.'
          : r >= 0.6
            ? 'Cukup baik. Ulangi skenario yang salah dan perhatikan bahwa satu insiden bisa mengenai lebih dari satu pilar.'
            : 'Pelajari kembali definisi tiap pilar pada CompTIA Module 9 dan Stallings Bab 1, lalu coba lagi.';
      b.innerHTML = `<p class="q-meta">Hasil akhir</p><p class="result-big">${L1.score}/${L1.order.length}</p><p style="max-width:60ch">${msg}</p>
      <div class="chips" style="margin:10px 0 16px">${CIA.map(c => `<span class="chip">${c.k}: ${c.d}</span>`).join('')}</div>
      <button class="btn primary" id="l1again" type="button">Ulangi dengan urutan acak</button>
      <button class="btn" id="l1go" type="button" style="margin-left:8px">Lanjut ke simulasi spoofing dan rogue system</button>`;
      $('#l1again').onclick = () => {
        initL1();
        drawL1();
      };
      $('#l1go').onclick = () => showLab('spoof');
      return;
    }
    const q = QS[L1.order[L1.i]];
    b.innerHTML = `<div class="q-meta"><span>Skenario ${L1.i + 1} dari ${L1.order.length}</span><span>Skor ${L1.score}</span></div>
    <p class="q-text">${G(q.t)}</p>
    <div class="cia-btns">${CIA.map(c => `<button type="button" class="cia" data-k="${c.k}"><span class="cia-k">${c.k}</span><span><b>${c.n}</b><small>${c.d}: ${c.h}</small><span class="flag"></span></span></button>`).join('')}</div>
    <div id="l1fb" aria-live="polite"></div>`;
    $$('.cia', b).forEach(btn => btn.addEventListener('click', () => answerL1(btn.dataset.k)));
  }
  function answerL1(k) {
    if (L1.sel) return;
    L1.sel = k;
    const q = QS[L1.order[L1.i]],
      ok = k === q.a;
    if (ok) L1.score++;
    $$('.cia').forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.k === q.a) {
        btn.classList.add('right');
        $('.flag', btn).textContent = '\u2713 Jawaban tepat';
      } else if (btn.dataset.k === k) {
        btn.classList.add('wrong');
        $('.flag', btn).textContent = '\u2715 Pilihan Anda';
      }
    });
    const last = L1.i === L1.order.length - 1;
    $('#l1fb').innerHTML =
      `<div class="fb ${ok ? 'good' : 'bad'}"><strong>${ok ? 'Tepat.' : 'Kurang tepat.'}</strong><p>${G(q.why)}</p></div>
    <dl class="facts"><div><dt>Jenis ancaman</dt><dd>${G(q.type)}</dd></div><div><dt>Kontrol yang sesuai</dt><dd>${G(q.ctl)}</dd></div></dl>
    <button class="btn primary" id="l1next" type="button">${last ? 'Lihat hasil' : 'Skenario berikutnya'}</button>`;
    $('#l1next').onclick = () => {
      L1.i++;
      L1.sel = null;
      drawL1();
      const t = $('.q-text') || $('.result-big');
      if (t) t.scrollIntoView({ block: 'nearest' });
    };
    $('#l1next').focus({ preventScroll: true });
  }

  /* ================= LAB 2: Simulator serangan (spoofing/rogue, DDoS, impersonation) ================= */
  const MAC = { v: '00:1A:2B:3C:4D:10', g: '00:1A:2B:3C:4D:01', a: '00:E0:66:66:66:66' };
  const T = (title, head, rows) => ({ title, head, rows });

  const arpT = (vb, gb) => [
    T(
      'ARP cache korban',
      ['IP', 'MAC', 'Status'],
      [['192.168.1.1', vb ? MAC.a : MAC.g, vb ? 'bad' : 'ok', vb ? 'Teracuni' : 'Sah']]
    ),
    T(
      'ARP cache gateway',
      ['IP', 'MAC', 'Status'],
      [['192.168.1.10', gb ? MAC.a : MAC.v, gb ? 'bad' : 'ok', gb ? 'Teracuni' : 'Sah']]
    )
  ];
  const dhcpCfg = k =>
    T(
      'Konfigurasi IP klien',
      ['Parameter', 'Nilai', 'Status'],
      k === 'none'
        ? [
            ['Alamat IP', 'belum ada', 'warn', 'Menunggu'],
            ['Gateway', '-', 'warn', 'Menunggu'],
            ['DNS', '-', 'warn', 'Menunggu']
          ]
        : k === 'legit'
          ? [
              ['Alamat IP', '192.168.1.20', 'ok', 'Sah'],
              ['Gateway', '192.168.1.1', 'ok', 'Sah'],
              ['DNS', '192.168.1.2', 'ok', 'Sah']
            ]
          : [
              ['Alamat IP', '192.168.1.99', 'bad', 'Palsu'],
              ['Gateway', '192.168.1.66', 'bad', 'Palsu'],
              ['DNS', '192.168.1.66', 'bad', 'Palsu']
            ]
    );
  const dhcpPorts = m =>
    T(
      'Port switch',
      ['Port', 'Kebijakan', 'Status'],
      [
        [
          'Fa0/1 klien',
          m.has('snoop') ? 'untrusted' : 'tanpa filter',
          m.has('snoop') ? 'ok' : 'warn',
          m.has('snoop') ? 'Dijaga' : 'Terbuka'
        ],
        [
          'Fa0/2 server DHCP',
          m.has('snoop') ? 'trusted' : 'tanpa filter',
          m.has('snoop') ? 'ok' : 'warn',
          m.has('snoop') ? 'Dijaga' : 'Terbuka'
        ],
        [
          'Fa0/3 penyerang',
          m.has('nac') ? '802.1X: tidak lolos' : m.has('snoop') ? 'untrusted' : 'tanpa filter',
          m.has('nac') || m.has('snoop') ? 'ok' : 'warn',
          m.has('nac') || m.has('snoop') ? 'Dijaga' : 'Terbuka'
        ]
      ]
    );
  const wifiScan = () =>
    T(
      'Jaringan Wi-Fi terdeteksi laptop',
      ['SSID dan BSSID', 'Sinyal dan keamanan', 'Status'],
      [
        ['Kampus-WiFi AA:11:22:33:44:01', '-58 dBm, WPA2-Enterprise', 'ok', 'Sah'],
        ['Kampus-WiFi DE:AD:66:66:66:66', '-31 dBm, terbuka', 'bad', 'Palsu']
      ]
    );
  const wifiConn = (k, vpn) =>
    T(
      'Status koneksi laptop',
      ['Parameter', 'Nilai', 'Status'],
      k === 'rogue'
        ? [
            ['Terhubung ke', 'AP palsu (DE:AD:..)', 'bad', 'Bahaya'],
            ['Enkripsi Wi-Fi', 'tidak ada', 'bad', 'Bahaya'],
            ['Validasi server', 'tidak dilakukan', 'bad', 'Bahaya'],
            [
              'Tunnel VPN',
              vpn ? 'aktif' : 'tidak ada',
              vpn ? 'ok' : 'warn',
              vpn ? 'Aman' : 'Perhatian'
            ]
          ]
        : [
            ['Terhubung ke', 'AP kampus (AA:11:..)', 'ok', 'Sah'],
            ['Enkripsi Wi-Fi', 'WPA2-Enterprise', 'ok', 'Aman'],
            ['Validasi server', 'sertifikat CA kampus', 'ok', 'Aman']
          ]
    );
  const DDOS_LINK = 50,
    DDOS_CAP = 20;
  const DDOS_LV = [
    { n: 'Sedang', atk: 200, rate: 2 },
    { n: 'Besar', atk: 600, rate: 3 },
    { n: 'Sangat besar', atk: 2000, rate: 5 }
  ];
  function ddosModel(c, atk) {
    const LEG = 2,
      cap = DDOS_CAP * (c.redun ? 3 : 1);
    const a = atk * (c.scrub ? 0.03 : 1) * (c.scrub && c.rl ? 0.25 : 1);
    const arr = a + LEG,
      lf = Math.min(1, DDOS_LINK / arr);
    let al = a * lf,
      ll = LEG * lf;
    if (c.rl && !c.scrub) {
      al *= 0.25;
      ll *= 0.98;
    }
    if (c.rl && c.scrub) ll *= 0.98;
    const tot = al + ll,
      ld = tot / cap,
      sf = ld > 1 ? 1 / ld : 1;
    return {
      linkPct: Math.min(100, Math.round((arr / DDOS_LINK) * 100)),
      srvPct: Math.min(99, Math.round(ld * 100)),
      succ: Math.round(((ll * sf) / LEG) * 100),
      rps: Math.round(tot * 2400),
      linkSat: arr > DDOS_LINK
    };
  }
  function ddosPovKey(R, first) {
    if (first) return 'normal';
    if (R.succ < 20) return 'flood';
    if (R.succ < 50) return 'weak';
    if (R.succ < 90 || R.srvPct >= 85) return 'slow';
    return 'filtered';
  }
  const ddosTable = R => {
    const st = v => (v < 70 ? ['ok', 'Normal'] : v < 90 ? ['warn', 'Tinggi'] : ['bad', 'Kritis']);
    const sv = st(R.srvPct),
      lk =
        R.linkPct >= 100
          ? ['bad', 'Jenuh']
          : R.linkPct >= 70
            ? ['warn', 'Tinggi']
            : ['ok', 'Normal'];
    const sc =
      R.succ >= 90
        ? ['ok', 'tersedia']
        : R.succ >= 50
          ? ['warn', 'lambat, sebagian gagal']
          : ['bad', 'tidak merespons'];
    return T(
      'Status server portal KRS',
      ['Metrik', 'Nilai', 'Status'],
      [
        ['Link ke origin', R.linkPct + '%', lk[0], lk[1]],
        ['CPU / RAM server', R.srvPct + '%', sv[0], sv[1]],
        ['Request sah yang berhasil', R.succ + '%', sc[0], sc[1]]
      ]
    );
  };
  const macT = k =>
    T(
      'Tabel MAC address switch',
      ['Port', 'MAC terdaftar', 'Status'],
      k === 'none'
        ? [
            ['Fa0/1 (perangkat resmi)', MAC.v, 'ok', 'Sah'],
            ['Fa0/5 (penyerang)', '-', 'warn', 'Belum tersambung']
          ]
        : k === 'spoofed'
          ? [
              ['Fa0/1 (perangkat resmi)', MAC.v, 'ok', 'Sah'],
              ['Fa0/5 (penyerang)', MAC.v, 'bad', 'MAC duplikat']
            ]
          : k === 'blocked'
            ? [
                ['Fa0/1 (perangkat resmi)', MAC.v, 'ok', 'Sah'],
                ['Fa0/5 (penyerang)', MAC.v, 'bad', 'Port dimatikan (violation)']
              ]
            : k === 'rejected'
              ? [
                  ['Fa0/1 (perangkat resmi)', MAC.v, 'ok', 'Sah'],
                  ['Fa0/5 (penyerang)', MAC.v + ' (autentikasi gagal)', 'bad', 'Ditolak 802.1X']
                ]
              : [
                  ['Fa0/1 (perangkat resmi)', MAC.v, 'ok', 'Sah'],
                  ['Fa0/5 (penyerang)', MAC.v, 'bad', 'Diizinkan (tidak terdeteksi)']
                ]
    );

  const SCEN = {
    arp: {
      id: 'arp',
      tab: 'ARP spoofing',
      title: 'ARP spoofing dan man-in-the-middle',
      intro:
        'Penyerang di segmen LAN yang sama memalsukan pemetaan IP ke MAC agar lalu lintas korban melewati perangkatnya. ARP tidak memiliki autentikasi, sehingga host menerima pembaruan tanpa memeriksa keasliannya.',
      nodes: [
        { id: 'victim', x: 100, y: 95, type: 'pc', label: 'Korban', sub: '192.168.1.10' },
        {
          id: 'attacker',
          x: 100,
          y: 305,
          type: 'pc',
          label: 'Penyerang',
          sub: '192.168.1.66',
          bad: true
        },
        { id: 'sw', x: 330, y: 200, type: 'switch', label: 'Switch', sub: 'akses L2' },
        { id: 'gw', x: 515, y: 200, type: 'router', label: 'Gateway', sub: '192.168.1.1' },
        { id: 'net', x: 655, y: 200, type: 'cloud', label: 'Internet', sub: '' }
      ],
      links: [
        ['victim', 'sw'],
        ['attacker', 'sw'],
        ['sw', 'gw'],
        ['gw', 'net']
      ],
      mits: [
        {
          id: 'dai',
          name: 'Dynamic ARP Inspection (DAI)',
          desc: 'Switch memvalidasi setiap ARP terhadap tabel binding DHCP snooping dan membuang yang tidak cocok.'
        },
        {
          id: 'static',
          name: 'Entri ARP statis',
          desc: 'Pasangan IP-MAC gateway ditetapkan manual pada host penting sehingga tidak dapat ditimpa.'
        },
        {
          id: 'tls',
          name: 'Enkripsi end-to-end (HTTPS/TLS)',
          desc: 'Tidak mencegah pengalihan, tetapi isi lalu lintas tidak terbaca penyerang.'
        }
      ],
      discuss:
        'Mengapa DAI memerlukan DHCP snooping? Apa yang terjadi pada host berIP statis, dan mengapa entri ARP statis sulit dipertahankan pada jaringan besar?',
      init: () => arpT(0, 0),
      run(m) {
        const S = [];
        S.push({
          kind: 'info',
          title: 'Kondisi normal',
          msg: 'Korban mengirim data ke gateway melalui switch. Cache ARP kedua sisi benar sehingga frame tiba di MAC gateway yang sah.',
          pkts: [{ route: ['victim', 'sw', 'gw'], kind: 'ok', label: 'Data' }],
          tables: arpT(0, 0)
        });
        S.push({
          kind: 'attack',
          title: 'ARP reply palsu ke korban',
          msg: 'Tanpa diminta, penyerang menyiarkan "192.168.1.1 berada di 00:E0:66:66:66:66" kepada korban. Host cenderung menerima pembaruan ARP terbaru tanpa verifikasi.',
          pkts: [{ route: ['attacker', 'sw', 'victim'], kind: 'bad', label: 'ARP palsu' }],
          tables: arpT(0, 0),
          mark: { attacker: 'bad' }
        });
        if (m.has('dai')) {
          S.push({
            kind: 'defense',
            title: 'Switch membuang ARP palsu',
            msg: 'DAI memeriksa pasangan IP-MAC pada tabel DHCP snooping. IP 192.168.1.1 terdaftar pada port gateway, bukan port penyerang, sehingga ARP reply dibuang dan dicatat sebagai pelanggaran.',
            pkts: [{ route: ['attacker', 'sw'], kind: 'block', label: 'Dibuang' }],
            tables: arpT(0, 0),
            mark: { sw: 'ok' }
          });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Serangan diblokir di switch',
              text: 'Pemalsuan ARP digagalkan di lapisan 2 sebelum mencapai korban. Prasyarat: DHCP snooping aktif agar tabel binding tersedia, dan port uplink ke gateway ditandai trusted.',
              cia: []
            }
          };
        }
        if (m.has('static')) {
          S.push({
            kind: 'defense',
            title: 'Host menolak pembaruan',
            msg: 'Entri ARP statis tidak dapat ditimpa oleh ARP reply. Cache korban dan gateway tetap benar sehingga lalu lintas tidak berpindah ke penyerang.',
            pkts: [{ route: ['attacker', 'sw', 'victim'], kind: 'block', label: 'Diabaikan' }],
            tables: arpT(0, 0),
            mark: { victim: 'ok', gw: 'ok' }
          });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Serangan tidak berpengaruh pada host yang dilindungi',
              text: 'Entri statis efektif untuk beberapa host kritis, tetapi tidak skalabel: setiap perubahan perangkat atau IP harus diperbarui manual. Pada jaringan industri, DAI lebih realistis.',
              cia: []
            }
          };
        }
        S.push({
          kind: 'attack',
          title: 'Cache ARP korban teracuni',
          msg: 'Korban kini yakin gateway berada di MAC penyerang.',
          pkts: [],
          tables: arpT(1, 0),
          mark: { victim: 'bad' }
        });
        S.push({
          kind: 'attack',
          title: 'Cache ARP gateway diracuni',
          msg: 'Penyerang mengirim ARP palsu kedua ke gateway: "192.168.1.10 berada di 00:E0:66:66:66:66". Kini kedua arah lalu lintas melewati penyerang.',
          pkts: [{ route: ['attacker', 'sw', 'gw'], kind: 'bad', label: 'ARP palsu' }],
          tables: arpT(1, 1),
          mark: { gw: 'bad' }
        });
        S.push({
          kind: 'attack',
          title: 'Lalu lintas korban dialihkan',
          msg: 'Frame korban ke gateway kini beralamat MAC penyerang, bukan MAC gateway.',
          pkts: [{ route: ['victim', 'sw', 'attacker'], kind: 'bad', label: 'Data korban' }],
          tables: arpT(1, 1)
        });
        const tls = m.has('tls');
        S.push({
          kind: 'attack',
          title: tls ? 'Penyerang meneruskan, isi terenkripsi' : 'Penyerang membaca dan meneruskan',
          msg: tls
            ? 'Penyerang tetap berada di tengah dan dapat mencatat metadata (siapa berbicara dengan siapa), tetapi isi HTTPS berupa ciphertext sehingga tidak dapat dibaca atau diubah tanpa terdeteksi.'
            : 'Penyerang membaca isi lalu lintas HTTP: kredensial login dan cookie sesi. Ia juga dapat mengubah isi sebelum meneruskannya ke gateway.',
          pkts: [
            {
              route: ['attacker', 'sw', 'gw'],
              kind: 'bad',
              label: tls ? 'Ciphertext' : 'Data terbaca'
            }
          ],
          tables: arpT(1, 1),
          mark: { attacker: 'bad' }
        });
        return {
          steps: S,
          outcome: tls
            ? {
                level: 'partial',
                title: 'Pengalihan berhasil, isi tetap terlindungi',
                text: 'Enkripsi menjaga kerahasiaan dan integritas isi, tetapi penyerang masih dapat menjatuhkan lalu lintas (ketersediaan) dan menganalisis metadata. Enkripsi melengkapi, bukan menggantikan, kontrol pada lapisan 2.',
                cia: ['A']
              }
            : {
                level: 'bad',
                title: 'Man-in-the-middle berhasil',
                text: 'Penyerang menguasai jalur antara korban dan gateway: kredensial dan sesi dapat dicuri, isi dapat dimodifikasi.',
                cia: ['C', 'I']
              }
        };
      }
    },
    dhcp: {
      id: 'dhcp',
      tab: 'Rogue DHCP server',
      title: 'Rogue DHCP server',
      intro:
        'Penyerang memasang server DHCP tidak sah di segmen yang sama. Klien menerima penawaran pertama yang tiba, sehingga gateway dan DNS klien dapat diarahkan ke penyerang.',
      nodes: [
        { id: 'client', x: 90, y: 200, type: 'pc', label: 'Klien baru', sub: 'DHCP client' },
        { id: 'sw', x: 300, y: 200, type: 'switch', label: 'Switch', sub: 'akses L2' },
        { id: 'dhcp', x: 520, y: 80, type: 'server', label: 'Server DHCP', sub: '192.168.1.2' },
        { id: 'gw', x: 520, y: 200, type: 'router', label: 'Gateway', sub: '192.168.1.1' },
        { id: 'net', x: 655, y: 200, type: 'cloud', label: 'Internet', sub: '' },
        {
          id: 'attacker',
          x: 300,
          y: 335,
          type: 'pc',
          label: 'Penyerang',
          sub: 'rogue DHCP',
          bad: true
        }
      ],
      links: [
        ['client', 'sw'],
        ['dhcp', 'sw'],
        ['gw', 'sw'],
        ['gw', 'net'],
        ['attacker', 'sw']
      ],
      mits: [
        {
          id: 'snoop',
          name: 'DHCP snooping',
          desc: 'Hanya port yang ditandai trusted boleh mengirim DHCP OFFER/ACK. Port lain diperlakukan untrusted.'
        },
        {
          id: 'nac',
          name: '802.1X / NAC pada port akses',
          desc: 'Perangkat yang tidak terautentikasi tidak diberi akses ke segmen sama sekali.'
        },
        {
          id: 'siem',
          name: 'Monitoring DHCP dan alert SIEM',
          desc: 'Sensor dan log memicu peringatan jika ada lebih dari satu server DHCP. Bersifat deteksi, bukan pencegahan.'
        }
      ],
      discuss:
        'Port mana yang harus ditandai trusted? Apa akibatnya jika port uplink ke server DHCP lupa ditandai trusted?',
      init: m => [dhcpCfg('none'), dhcpPorts(m)],
      run(m) {
        const S = [],
          prot = m.has('snoop') || m.has('nac'),
          tb = k => [dhcpCfg(k), dhcpPorts(m)];
        S.push({
          kind: 'info',
          title: 'Klien meminta alamat IP',
          msg: 'Klien menyiarkan DHCP DISCOVER. Semua host pada segmen, termasuk penyerang, ikut menerimanya.',
          pkts: [
            { route: ['client', 'sw', 'dhcp'], kind: 'ok', label: 'DISCOVER' },
            { route: ['client', 'sw', 'attacker'], kind: 'ok', label: 'DISCOVER' }
          ],
          tables: tb('none')
        });
        if (prot) {
          const why = m.has('snoop')
            ? 'DHCP snooping: OFFER datang dari port untrusted (Fa0/3), jadi dibuang dan dicatat.'
            : '802.1X: perangkat penyerang tidak lolos autentikasi sehingga port Fa0/3 tidak diizinkan meneruskan frame ke segmen.';
          S.push({
            kind: 'defense',
            title: 'Penawaran palsu dibuang',
            msg: why + ' Penawaran server sah tetap sampai.',
            pkts: [
              { route: ['attacker', 'sw'], kind: 'block', label: 'OFFER palsu' },
              { route: ['dhcp', 'sw', 'client'], kind: 'ok', label: 'OFFER sah', delay: 250 }
            ],
            tables: tb('none'),
            mark: { sw: 'ok' }
          });
          S.push({
            kind: 'info',
            title: 'Klien menerima konfigurasi sah',
            msg: 'Klien mengirim REQUEST dan menerima ACK dari server DHCP yang benar. Gateway dan DNS mengarah ke perangkat resmi.',
            pkts: [
              { route: ['client', 'sw', 'dhcp'], kind: 'ok', label: 'REQUEST' },
              { route: ['dhcp', 'sw', 'client'], kind: 'ok', label: 'ACK', delay: 500 }
            ],
            tables: tb('legit'),
            mark: { client: 'ok' }
          });
          if (m.has('siem'))
            S.push({
              kind: 'defense',
              title: 'Alert tercatat di SIEM',
              msg: 'Log switch memuat percobaan OFFER dari port untrusted. Analis SOC mendapat alert dan dapat menelusuri perangkat penyerang.',
              pkts: [],
              tables: tb('legit')
            });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Rogue DHCP dicegah',
              text: 'Kontrol pencegahan bekerja di lapisan 2 sehingga klien tidak pernah melihat penawaran palsu. DHCP snooping juga menghasilkan tabel binding yang dipakai DAI dan IP Source Guard.',
              cia: []
            }
          };
        }
        S.push({
          kind: 'attack',
          title: 'Dua penawaran, penyerang lebih cepat',
          msg: 'Server palsu menjawab lebih cepat dan menawarkan gateway serta DNS milik penyerang. Server sah menjawab beberapa milidetik kemudian.',
          pkts: [
            { route: ['attacker', 'sw', 'client'], kind: 'bad', label: 'OFFER palsu' },
            { route: ['dhcp', 'sw', 'client'], kind: 'ok', label: 'OFFER sah', delay: 500 }
          ],
          tables: tb('none'),
          mark: { attacker: 'bad' }
        });
        S.push({
          kind: 'attack',
          title: 'Klien menerima penawaran pertama',
          msg: 'Klien memakai penawaran yang tiba lebih dulu. Gateway dan DNS klien sekarang menunjuk ke penyerang.',
          pkts: [
            { route: ['client', 'sw', 'attacker'], kind: 'bad', label: 'REQUEST' },
            { route: ['attacker', 'sw', 'client'], kind: 'bad', label: 'ACK', delay: 500 }
          ],
          tables: tb('rogue'),
          mark: { client: 'bad' }
        });
        S.push({
          kind: 'attack',
          title: 'Lalu lintas klien dibelokkan',
          msg: 'Klien membuka portal bank. DNS penyerang menjawab dengan IP server tiruan, dan semua lalu lintas keluar melewati "gateway" penyerang.',
          pkts: [{ route: ['client', 'sw', 'attacker'], kind: 'bad', label: 'DNS dan data' }],
          tables: tb('rogue')
        });
        if (m.has('siem')) {
          S.push({
            kind: 'defense',
            title: 'SIEM mengirim alert',
            msg: 'Sensor melihat dua DHCP OFFER dari MAC berbeda pada VLAN yang sama dalam waktu singkat. Alert "rogue DHCP" masuk ke SOC, tetapi klien sudah sempat terdampak.',
            pkts: [],
            tables: tb('rogue')
          });
          return {
            steps: S,
            outcome: {
              level: 'partial',
              title: 'Terdeteksi, belum tercegah',
              text: 'Deteksi mempersingkat waktu respons, tetapi kerusakan awal sudah terjadi. Kombinasikan dengan DHCP snooping agar serangan berhenti di switch.',
              cia: ['C', 'I']
            }
          };
        }
        return {
          steps: S,
          outcome: {
            level: 'bad',
            title: 'Klien terjebak ke gateway dan DNS palsu',
            text: 'Tanpa kontrol pada switch, klien tidak dapat membedakan server DHCP asli dan palsu. Penyerang dapat menyadap, mengubah, atau mengalihkan lalu lintas ke situs tiruan.',
            cia: ['C', 'I', 'A']
          }
        };
      }
    },
    evil: {
      id: 'evil',
      tab: 'Rogue AP (evil twin)',
      title: 'Rogue access point (evil twin)',
      intro:
        'Penyerang memasang AP yang meniru SSID kampus dengan sinyal lebih kuat. Perangkat yang mengingat SSID tersebut dapat tersambung otomatis ke AP palsu.',
      nodes: [
        { id: 'laptop', x: 95, y: 200, type: 'pc', label: 'Laptop', sub: 'pengguna' },
        { id: 'apL', x: 310, y: 85, type: 'ap', label: 'AP kampus', sub: 'WPA2-Enterprise' },
        { id: 'apR', x: 310, y: 325, type: 'ap', label: 'AP palsu', sub: 'terbuka', bad: true },
        { id: 'radius', x: 510, y: 85, type: 'server', label: 'RADIUS', sub: 'autentikasi' },
        { id: 'net', x: 640, y: 205, type: 'cloud', label: 'Internet', sub: '' }
      ],
      links: [
        ['laptop', 'apL', 'wl'],
        ['laptop', 'apR', 'wl'],
        ['apL', 'radius'],
        ['radius', 'net'],
        ['apR', 'net']
      ],
      mits: [
        {
          id: 'dot1x',
          name: 'WPA2/WPA3-Enterprise dengan validasi sertifikat',
          desc: 'Klien memverifikasi sertifikat server RADIUS yang ditandatangani CA kampus sebelum mengirim kredensial.'
        },
        {
          id: 'wips',
          name: 'Wireless IPS (deteksi dan containment)',
          desc: 'Sensor mengenali BSSID tak terdaftar yang memakai SSID kampus, lalu memutus klien yang tersambung ke AP itu.'
        },
        {
          id: 'vpn',
          name: 'VPN otomatis (always-on)',
          desc: 'Lalu lintas aplikasi dienkripsi melalui tunnel, apa pun jaringan Wi-Fi yang dipakai.'
        }
      ],
      discuss:
        'Mengapa validasi sertifikat server pada 802.1X menentukan keamanan Wi-Fi enterprise? Apa risikonya jika pengguna diminta "abaikan peringatan sertifikat"?',
      init: () => [
        T(
          'Jaringan Wi-Fi terdeteksi laptop',
          ['SSID dan BSSID', 'Sinyal dan keamanan', 'Status'],
          [['Belum memindai', '-', 'warn', 'Menunggu']]
        )
      ],
      run(m) {
        const S = [],
          vpn = m.has('vpn');
        S.push({
          kind: 'info',
          title: 'Laptop memindai jaringan',
          msg: 'Dua AP menyiarkan SSID "Kampus-WiFi". AP palsu memakai daya pancar lebih besar sehingga sinyalnya jauh lebih kuat daripada AP resmi.',
          pkts: [
            { route: ['laptop', 'apL'], kind: 'ok', label: 'Probe' },
            { route: ['laptop', 'apR'], kind: 'ok', label: 'Probe' }
          ],
          tables: [wifiScan()],
          mark: { apR: 'bad' }
        });
        if (m.has('dot1x')) {
          S.push({
            kind: 'defense',
            title: 'Laptop menolak AP palsu',
            msg: 'Laptop memvalidasi sertifikat server RADIUS. AP palsu tidak dapat menunjukkan sertifikat yang dipercaya CA kampus (dan tidak menawarkan 802.1X), sehingga laptop tidak menyambung dan memilih AP resmi.',
            pkts: [
              { route: ['apR', 'laptop'], kind: 'block', label: 'Sertifikat tidak valid' },
              { route: ['laptop', 'apL'], kind: 'ok', label: 'EAP', delay: 300 },
              { route: ['apL', 'radius'], kind: 'ok', label: 'RADIUS', delay: 900 }
            ],
            tables: [wifiScan(), wifiConn('legit', vpn)],
            mark: { apL: 'ok', laptop: 'ok' }
          });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Evil twin gagal menipu klien',
              text: 'Otentikasi timbal balik membuat klien memeriksa jati diri jaringan, bukan sekadar nama SSID. Kunci keberhasilannya: klien dikonfigurasi memercayai CA tertentu dan tidak boleh melewati peringatan sertifikat.',
              cia: []
            }
          };
        }
        S.push({
          kind: 'attack',
          title: 'Laptop tersambung ke AP palsu',
          msg: 'Tanpa validasi identitas jaringan, sistem operasi memilih SSID yang dikenal dengan sinyal terkuat. Laptop tersambung ke AP penyerang.',
          pkts: [{ route: ['laptop', 'apR'], kind: 'bad', label: 'Association' }],
          tables: [wifiScan(), wifiConn('rogue', vpn)],
          mark: { laptop: 'bad' }
        });
        S.push({
          kind: 'attack',
          title: 'Portal login palsu',
          msg: vpn
            ? 'VPN melindungi lalu lintas aplikasi, tetapi portal login palsu tetap meminta kredensial kampus. Jika pengguna mengetikkannya, kredensial tercuri.'
            : 'AP palsu menampilkan portal login tiruan. Kredensial yang diketik dikirim ke penyerang, dan lalu lintas HTTP dapat dibaca.',
          pkts: [
            { route: ['apR', 'laptop'], kind: 'bad', label: 'Portal palsu' },
            { route: ['laptop', 'apR'], kind: 'bad', label: 'Kredensial', delay: 500 }
          ],
          tables: [wifiScan(), wifiConn('rogue', vpn)]
        });
        if (m.has('wips')) {
          S.push({
            kind: 'defense',
            title: 'WIPS memutus klien dari AP palsu',
            msg: 'Sensor mengklasifikasikan BSSID DE:AD:66:66:66:66 sebagai rogue (SSID sama, BSSID tidak terdaftar). Sistem mengirim deauthentication ke klien yang tersambung dan mengirim alert ke SOC.',
            pkts: [{ route: ['apR', 'laptop'], kind: 'block', label: 'Deauth' }],
            tables: [wifiScan(), wifiConn('rogue', vpn)],
            mark: { apR: 'ok' }
          });
        }
        if (m.has('wips') || vpn) {
          return {
            steps: S,
            outcome: {
              level: 'partial',
              title: 'Dampak dibatasi, tetapi tidak dicegah',
              text: m.has('wips')
                ? 'Ada jeda antara koneksi ke AP palsu dan containment; kredensial yang diketik pada jeda itu sudah terpapar. Kontrol paling andal tetap validasi sertifikat (802.1X).'
                : 'VPN menjaga lalu lintas aplikasi, tetapi pengguna tetap tersambung ke AP palsu dan portal palsunya masih dapat mencuri kredensial. Kontrol paling andal tetap validasi sertifikat (802.1X).',
              cia: ['C']
            }
          };
        }
        return {
          steps: S,
          outcome: {
            level: 'bad',
            title: 'Kredensial dan lalu lintas pengguna terekspos',
            text: 'Nama SSID bukan bukti identitas jaringan. Tanpa autentikasi timbal balik, siapa pun dapat menirunya.',
            cia: ['C', 'I']
          }
        };
      }
    },
    ddos: {
      id: 'ddos',
      tab: 'DDoS',
      title: 'Distributed Denial of Service (DDoS)',
      intro:
        'Botnet berisi ribuan perangkat terinfeksi mengirim permintaan palsu secara bersamaan ke server, menghabiskan kapasitas CPU, memori, dan koneksi sehingga pengguna sah tidak dapat dilayani.',
      nodes: [
        { id: 'client', x: 85, y: 95, type: 'pc', label: 'Klien sah', sub: 'mahasiswa' },
        {
          id: 'botnet',
          x: 95,
          y: 280,
          type: 'pc',
          label: 'Botnet',
          sub: 'ribuan perangkat terinfeksi',
          bad: true
        },
        { id: 'net', x: 280, y: 200, type: 'cloud', label: 'Internet', sub: '' },
        { id: 'scrub', x: 445, y: 200, type: 'router', label: 'Scrubbing / CDN', sub: 'opsional' },
        { id: 'server', x: 610, y: 200, type: 'server', label: 'Server portal KRS', sub: '' }
      ],
      links: [
        ['client', 'net'],
        ['botnet', 'net'],
        ['net', 'scrub'],
        ['scrub', 'server']
      ],
      mits: [
        {
          id: 'scrub',
          name: 'Scrubbing / CDN (anycast)',
          desc: 'Lalu lintas disebar dan disaring di banyak titik tepi sebelum mencapai origin, sehingga lonjakan besar diserap sebelum sampai ke server asli.'
        },
        {
          id: 'ratelimit',
          name: 'Rate limiting & SYN cookies',
          desc: 'Server atau firewall membatasi jumlah request per IP dan menangani SYN flood tanpa langsung mengalokasikan resource penuh.'
        },
        {
          id: 'redun',
          name: 'Redundansi & auto-scaling',
          desc: 'Beberapa origin server dan penambahan kapasitas otomatis saat beban naik, sehingga satu titik tidak mudah kolaps.'
        }
      ],
      discuss:
        'Mengapa mitigasi DDoS yang efektif ditempatkan di tepi jaringan (edge), bukan hanya di server tujuan? Apa keterbatasan auto-scaling saja tanpa filtering di depan?',
      init: () => [ddosTable(ddosModel({}, 0))],
      run(m) {
        const set = { scrub: m.has('scrub'), rl: m.has('ratelimit'), redun: m.has('redun') },
          L = DDOS_LV[sim.ddosLvl || 0];
        const S = [],
          fmt = n => n.toLocaleString('id-ID');
        const flowOf = c => ({
          rate: L.rate,
          die: c.scrub ? 2 : c.rl ? 3 : -1,
          dieP: c.scrub ? (c.rl ? 0.9925 : 0.97) : c.rl ? 0.75 : 0
        });
        const meta = (R, first, c) => ({
          load: R.srvPct,
          link: R.linkPct,
          pov: ddosPovKey(R, first),
          rps: fmt(R.rps) + ' /dtk',
          succ: R.succ,
          flow: first ? null : flowOf(c)
        });
        const legit = R =>
          R.succ >= 50
            ? {
                route: ['client', 'net', 'scrub', 'server'],
                kind: 'ok',
                label: 'Request sah',
                delay: 400
              }
            : {
                route: ['client', 'net', 'scrub', 'server'],
                kind: 'block',
                label: 'Timeout',
                delay: 400
              };
        const R0 = ddosModel({}, 0),
          Rn = ddosModel({}, L.atk);
        S.push({
          kind: 'info',
          title: 'Lalu lintas normal',
          msg: 'Klien sah membuka portal KRS. Link ke origin longgar dan server merespons cepat karena beban masih ringan.',
          pkts: [{ route: ['client', 'net', 'scrub', 'server'], kind: 'ok', label: 'Request' }],
          tables: [ddosTable(R0)],
          ddos: meta(R0, true, {})
        });
        S.push({
          kind: 'attack',
          title: 'Botnet melancarkan banjir permintaan (' + L.n.toLowerCase() + ')',
          msg:
            'Ribuan bot mengirim permintaan palsu serempak. Pada skala ini volumenya sekitar ' +
            L.atk +
            ' satuan, sedangkan link ke origin hanya berkapasitas ' +
            DDOS_LINK +
            ' dan server ' +
            DDOS_CAP +
            '. Lalu lintas sah (' +
            2 +
            ' satuan) tenggelam di antara flood.',
          pkts: [
            { route: ['botnet', 'net'], kind: 'bad', label: 'Flood' },
            { route: ['botnet', 'net'], kind: 'bad', label: 'Flood', delay: 150 },
            { route: ['botnet', 'net'], kind: 'bad', label: 'Flood', delay: 300 }
          ],
          tables: [ddosTable(Rn)],
          mark: { botnet: 'bad' },
          ddos: meta(Rn, false, {})
        });
        const cur = {};
        let last = Rn;
        if (set.scrub) {
          cur.scrub = true;
          const R = (last = ddosModel(cur, L.atk));
          S.push({
            kind: 'defense',
            title: 'Scrubbing/CDN menyaring di tepi',
            msg:
              'Sekitar 97% paket serangan dibuang di banyak titik tepi sebelum masuk ke link origin. Link kini terpakai ' +
              R.linkPct +
              '%' +
              (R.linkSat ? ' (masih jenuh karena sisa flood terlalu besar)' : '') +
              ' dan server menerima ' +
              fmt(R.rps) +
              ' request/dtk.',
            pkts: [{ route: ['net', 'scrub'], kind: 'block', label: 'Disaring' }, legit(R)],
            tables: [ddosTable(R)],
            mark: { scrub: 'ok', botnet: 'bad' },
            ddos: meta(R, false, cur)
          });
        }
        if (set.rl) {
          cur.rl = true;
          const R = (last = ddosModel(cur, L.atk));
          S.push({
            kind: 'defense',
            title: set.scrub
              ? 'Rate limiting memangkas sisa serangan'
              : 'Rate limiting membatasi request per IP',
            msg: set.scrub
              ? 'Pembatasan per IP kini juga berjalan di edge, sehingga sisa lalu lintas yang lolos filter dipangkas sekitar 75% lagi. Server hanya menerima ' +
                fmt(R.rps) +
                ' request/dtk.'
              : 'Server menolak sekitar 75% request berlebihan dan SYN cookies mencegah alokasi resource penuh. Tetapi penolakan terjadi di server, setelah paket serangan sudah memenuhi link origin (' +
                R.linkPct +
                '%). Request sah tetap banyak yang tidak pernah sampai.',
            pkts: [
              { route: ['botnet', 'net', 'scrub', 'server'], kind: 'block', label: 'Dibatasi' },
              legit(R)
            ],
            tables: [ddosTable(R)],
            mark: { server: R.succ >= 50 ? 'ok' : 'bad' },
            ddos: meta(R, false, cur)
          });
        }
        if (set.redun) {
          cur.redun = true;
          const R = (last = ddosModel(cur, L.atk));
          S.push({
            kind: 'defense',
            title: 'Auto-scaling menambah kapasitas server',
            msg:
              'Instance server bertambah sehingga kapasitas menjadi 3x. Beban server turun ke ' +
              R.srvPct +
              '%, tetapi auto-scaling tidak mengurangi paket serangan maupun beban link (' +
              R.linkPct +
              '%).' +
              (R.succ < 50 ? ' Selama link jenuh, request sah tetap banyak yang gagal.' : ''),
            pkts: [
              {
                route: ['botnet', 'net', 'scrub', 'server'],
                kind: R.succ >= 50 ? 'block' : 'bad',
                label: R.succ >= 50 ? 'Diserap' : 'Flood'
              },
              legit(R)
            ],
            tables: [ddosTable(R)],
            mark: { server: R.succ >= 50 ? 'ok' : 'bad' },
            ddos: meta(R, false, cur)
          });
        }
        if (!set.scrub && !set.rl && !set.redun) {
          S.push({
            kind: 'attack',
            title: 'Server kehabisan resource',
            msg: 'Link penuh, antrian koneksi meluap, dan CPU jenuh. Permintaan klien sah ikut timeout karena server tidak dapat membedakan lalu lintas jahat dari yang sah.',
            pkts: [
              { route: ['client', 'net', 'scrub', 'server'], kind: 'block', label: 'Timeout' }
            ],
            tables: [ddosTable(Rn)],
            mark: { server: 'bad' },
            ddos: meta(Rn, false, {})
          });
        }
        const R = last,
          lvl = R.succ >= 90 ? 'ok' : R.succ >= 50 ? 'partial' : 'bad',
          n = (set.scrub ? 1 : 0) + (set.rl ? 1 : 0) + (set.redun ? 1 : 0);
        const parts = [];
        if (R.linkSat && !set.scrub)
          parts.push(
            'Link ke origin jenuh, sehingga paket sah ikut terbuang sebelum sempat diproses. Rate limiting dan auto-scaling berada di belakang link, jadi tidak bisa memperbaikinya. Hanya filtering di edge (scrubbing/CDN) yang menolak paket sebelum link.'
          );
        else if (R.linkSat)
          parts.push(
            'Bahkan setelah scrubbing, sisa flood masih melebihi kapasitas link. Skala serangan sebesar ini butuh lapisan tambahan, misalnya rate limiting di edge.'
          );
        else if (R.srvPct >= 90)
          parts.push(
            'Server nyaris jenuh (' +
              R.srvPct +
              '%). Tambahkan kapasitas cadangan atau pembatasan request agar ada ruang gerak.'
          );
        else
          parts.push(
            'Link dan server tidak jenuh (server ' +
              R.srvPct +
              '%), sehingga ' +
              R.succ +
              '% request sah berhasil.'
          );
        if (n === 3)
          parts.push(
            'Tiga lapisan bekerja berlapis: scrubbing menyaring volume, rate limiting memangkas sisa, redundansi memberi cadangan kapasitas. Inilah defense in depth.'
          );
        else if (n === 0)
          parts.push(
            'Ini pelanggaran ketersediaan murni: data tidak bocor atau berubah, layanan saja yang tidak bisa dipakai.'
          );
        else if (n === 1 && lvl === 'ok')
          parts.push(
            'Satu lapisan cukup pada skala ini. Coba naikkan skala serangan untuk melihat kapan satu lapisan tidak lagi memadai.'
          );
        else if (n === 2 && lvl !== 'ok')
          parts.push('Dua lapisan belum cukup pada skala ini. Coba aktifkan ketiganya.');
        return {
          steps: S,
          outcome: {
            level: lvl,
            title:
              lvl === 'ok'
                ? 'Layanan tetap terlayani'
                : lvl === 'partial'
                  ? 'Layanan bertahan, tetapi terganggu'
                  : 'Portal KRS lumpuh',
            text: parts.join(' '),
            cia: lvl === 'ok' ? [] : ['A']
          }
        };
      }
    },
    imp: {
      id: 'imp',
      tab: 'Impersonation (MAC spoofing)',
      title: 'Impersonation via MAC address spoofing',
      intro:
        'Penyerang mengubah alamat MAC kartu jaringannya agar identik dengan perangkat resmi yang sudah dipercaya jaringan, lalu mencolokkan diri ke port lain untuk berpura-pura menjadi perangkat itu.',
      nodes: [
        { id: 'legit', x: 95, y: 95, type: 'pc', label: 'Perangkat resmi', sub: 'komputer lab' },
        {
          id: 'attacker',
          x: 95,
          y: 325,
          type: 'pc',
          label: 'Penyerang',
          sub: 'mengkloning MAC',
          bad: true
        },
        { id: 'sw', x: 330, y: 210, type: 'switch', label: 'Switch akses', sub: 'port security' },
        {
          id: 'srv',
          x: 560,
          y: 110,
          type: 'server',
          label: 'Server internal',
          sub: 'data akademik'
        },
        { id: 'net', x: 560, y: 310, type: 'cloud', label: 'Internet', sub: '' }
      ],
      links: [
        ['legit', 'sw'],
        ['attacker', 'sw'],
        ['sw', 'srv'],
        ['sw', 'net']
      ],
      mits: [
        {
          id: 'portsec',
          name: 'Port security (sticky MAC, satu MAC per port)',
          desc: 'Switch mengunci MAC pertama yang terlihat pada tiap port. Bila MAC yang sama muncul di port lain, port itu dianggap melanggar kebijakan dan dinonaktifkan otomatis.'
        },
        {
          id: 'dot1x',
          name: '802.1X berbasis sertifikat/kredensial perangkat',
          desc: 'Otentikasi memverifikasi identitas perangkat lewat sertifikat atau kredensial, bukan sekadar alamat MAC yang mudah dipalsukan lewat perangkat lunak.'
        },
        {
          id: 'siem',
          name: 'Monitoring anomali MAC (SIEM)',
          desc: 'Sistem mendeteksi satu MAC yang muncul di dua port berbeda dalam waktu berdekatan ("MAC flapping") dan mengirim alert. Bersifat deteksi, bukan pencegahan.'
        }
      ],
      discuss:
        'Mengapa autentikasi berbasis sertifikat lebih andal dibanding filter alamat MAC saja? Apa risikonya bila kebijakan port security hanya mencatat log tanpa benar-benar mematikan port yang melanggar?',
      init: () => [macT('none')],
      run(m) {
        const S = [],
          IDLE = {
            mac1: MAC.v,
            mac5: 'belum tersambung',
            tag1: 'Fa0/1 \u00b7 terdaftar',
            tag5: 'belum tersambung',
            chip1: 'ok',
            chip5: '',
            state: 'idle',
            led5: ''
          };
        S.push({
          kind: 'info',
          title: 'Kondisi normal',
          msg: 'Perangkat resmi terhubung di Fa0/1 dengan MAC yang terdaftar. Belum ada perangkat lain yang mengaku memakai MAC tersebut.',
          pkts: [{ route: ['legit', 'sw', 'srv'], kind: 'ok', label: 'Data' }],
          tables: [macT('none')],
          imp: IDLE
        });
        S.push({
          kind: 'attack',
          title: 'Penyerang mengkloning alamat MAC',
          msg: 'Penyerang mengganti alamat MAC kartu jaringannya menjadi sama dengan perangkat resmi, lalu mencolokkan diri ke port Fa0/5.',
          pkts: [{ route: ['attacker', 'sw'], kind: 'bad', label: 'MAC dikloning' }],
          tables: [macT('spoofed')],
          mark: { attacker: 'bad' },
          imp: {
            mac1: MAC.v,
            mac5: MAC.v,
            tag1: 'Fa0/1 \u00b7 terdaftar',
            tag5: 'Fa0/5 \u00b7 MAC identik',
            chip1: 'ok',
            chip5: 'bad',
            state: 'dup',
            led5: 'dup',
            badgeAtk: 'bad',
            flash: true
          }
        });
        if (m.has('portsec')) {
          S.push({
            kind: 'defense',
            title: 'Port security mematikan port',
            msg: 'Switch mendeteksi MAC yang sudah terikat di Fa0/1 kini muncul pula di Fa0/5. Ini melanggar kebijakan sticky MAC, sehingga Fa0/5 langsung dinonaktifkan (violation shutdown).',
            pkts: [{ route: ['attacker', 'sw'], kind: 'block', label: 'Port dimatikan' }],
            tables: [macT('blocked')],
            mark: { sw: 'ok' },
            imp: {
              mac1: MAC.v,
              mac5: MAC.v,
              tag1: 'Fa0/1 \u00b7 terdaftar',
              tag5: 'Fa0/5 \u00b7 shutdown (violation)',
              chip1: 'ok',
              chip5: 'bad',
              state: 'blocked',
              led5: 'bad',
              badgeAtk: 'bad'
            }
          });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Impersonation MAC gagal',
              text: 'Port security mencegah satu alamat MAC dipakai di lebih dari satu port secara bersamaan. Prasyaratnya: mode sticky diaktifkan dan aksi pelanggaran diatur ke shutdown atau restrict, bukan hanya protect.',
              cia: []
            }
          };
        }
        if (m.has('dot1x')) {
          S.push({
            kind: 'defense',
            title: 'Autentikasi 802.1X menolak perangkat',
            msg: 'Walau alamat MAC identik, penyerang tidak memiliki sertifikat atau kredensial perangkat resmi. Proses EAP gagal sehingga port tetap berstatus unauthorized.',
            pkts: [{ route: ['attacker', 'sw'], kind: 'block', label: 'EAP gagal' }],
            tables: [macT('rejected')],
            mark: { sw: 'ok' },
            imp: {
              mac1: MAC.v,
              mac5: MAC.v,
              tag1: 'Fa0/1 \u00b7 terdaftar',
              tag5: 'Fa0/5 \u00b7 EAP gagal',
              chip1: 'ok',
              chip5: 'bad',
              state: 'rejected',
              led5: 'bad',
              badgeAtk: 'bad'
            }
          });
          return {
            steps: S,
            outcome: {
              level: 'ok',
              title: 'Impersonation MAC gagal',
              text: '802.1X mengautentikasi identitas perangkat, bukan sekadar alamat yang tampak di frame Ethernet. Alamat MAC bisa dipalsukan lewat perangkat lunak, tetapi sertifikat atau kredensial pribadi perangkat tidak semudah itu ditiru.',
              cia: []
            }
          };
        }
        S.push({
          kind: 'attack',
          title: 'Penyerang memperoleh akses',
          msg: 'Switch tidak dapat membedakan perangkat resmi dan penyerang karena keduanya memakai MAC yang sama. Penyerang mendapat akses ke segmen yang sama seperti perangkat resmi.',
          pkts: [{ route: ['attacker', 'sw', 'srv'], kind: 'bad', label: 'Akses data' }],
          tables: [macT('undetected')],
          imp: {
            mac1: MAC.v,
            mac5: MAC.v,
            tag1: 'Fa0/1 \u00b7 terdaftar',
            tag5: 'Fa0/5 \u00b7 diizinkan (tak terdeteksi)',
            chip1: 'ok',
            chip5: 'bad',
            state: 'breach',
            led5: 'bad',
            badgeAtk: 'bad'
          }
        });
        if (m.has('siem')) {
          S.push({
            kind: 'defense',
            title: 'SIEM mendeteksi MAC flapping',
            msg: 'Log menunjukkan MAC yang sama berpindah antar port dalam waktu singkat. Alert masuk ke SOC, tetapi penyerang sudah sempat mengakses jaringan sebelum ditindak.',
            pkts: [],
            tables: [macT('undetected')],
            imp: {
              mac1: MAC.v,
              mac5: MAC.v,
              tag1: 'Fa0/1 \u00b7 terdaftar',
              tag5: 'Fa0/5 \u00b7 alert SIEM terkirim',
              chip1: 'ok',
              chip5: 'warn',
              state: 'breach',
              led5: 'warn',
              badgeAtk: 'bad'
            }
          });
          return {
            steps: S,
            outcome: {
              level: 'partial',
              title: 'Terdeteksi, belum tercegah',
              text: 'Deteksi mempersingkat waktu penyerang berada di jaringan, tetapi akses awal sudah terjadi. Kombinasikan dengan port security atau 802.1X agar impersonation dicegah sejak awal, bukan hanya diketahui setelahnya.',
              cia: ['C', 'I']
            }
          };
        }
        return {
          steps: S,
          outcome: {
            level: 'bad',
            title: 'Penyerang menyamar sebagai perangkat resmi',
            text: 'Alamat MAC bukan bukti identitas yang kuat karena mudah diubah lewat perangkat lunak. Tanpa port security atau autentikasi berbasis sertifikat, jaringan tidak dapat membedakan perangkat asli dan tiruannya.',
            cia: ['C', 'I']
          }
        };
      }
    }
  };
  const SIM_NOTE =
    ' Simulasi ini murni visual: tidak ada paket nyata yang dikirim ke jaringan mana pun.';
  const SIMLABS = {
    spoof: {
      list: ['arp', 'dhcp', 'evil'],
      title: 'Spoofing dan rogue system',
      ind:
        'Menganalisis serangan spoofing dan rogue system serta teknik mitigasinya. Sebuah skenario dianggap tuntas setelah Anda melihat hasil tanpa mitigasi dan hasil dengan mitigasi.' +
        SIM_NOTE,
      intro:
        'Jalankan setiap serangan tanpa mitigasi, lalu aktifkan kontrol dan ulangi untuk membandingkan.'
    },
    ddos: {
      list: ['ddos'],
      title: 'Serangan DDoS (Distributed Denial of Service)',
      ind:
        'Menganalisis serangan denial of service terdistribusi (DDoS) serta teknik mitigasinya. Skenario dianggap tuntas setelah Anda melihat hasil tanpa mitigasi dan hasil dengan mitigasi.' +
        SIM_NOTE,
      intro:
        'Jalankan serangan tanpa mitigasi, lalu aktifkan kontrol dan ulangi untuk membandingkan.'
    },
    imp: {
      list: ['imp'],
      title: 'Impersonation (MAC spoofing)',
      ind:
        'Menganalisis serangan impersonation melalui pemalsuan alamat MAC serta teknik mitigasinya. Skenario dianggap tuntas setelah Anda melihat hasil tanpa mitigasi dan hasil dengan mitigasi.' +
        SIM_NOTE,
      intro:
        'Jalankan serangan tanpa mitigasi, lalu aktifkan kontrol dan ulangi untuk membandingkan.'
    }
  };

  const sim = {
    sc: null,
    mits: new Set(),
    built: null,
    idx: -1,
    playing: false,
    busy: false,
    token: 0
  };

  function iconSvg(t) {
    switch (t) {
      case 'pc':
        return '<rect x="-14" y="-12" width="28" height="18" rx="2" class="ic"/><path d="M-8 11h16M0 6v5" class="ic"/>';
      case 'server':
        return '<rect x="-13" y="-15" width="26" height="9" rx="2" class="ic"/><rect x="-13" y="-4" width="26" height="9" rx="2" class="ic"/><circle cx="-8" cy="-10.5" r="1.3" class="icf"/><circle cx="-8" cy="0.5" r="1.3" class="icf"/>';
      case 'router':
        return '<rect x="-15" y="-3" width="30" height="12" rx="3" class="ic"/><path d="M-8 -3l-4 -9M8 -3l4 -9" class="ic"/><circle cx="-7" cy="3" r="1.4" class="icf"/><circle cx="-1" cy="3" r="1.4" class="icf"/>';
      case 'switch':
        return '<rect x="-16" y="-8" width="32" height="15" rx="2" class="ic"/><rect x="-11" y="-3" width="5" height="5" class="icf"/><rect x="-3" y="-3" width="5" height="5" class="icf"/><rect x="5" y="-3" width="5" height="5" class="icf"/>';
      case 'ap':
        return '<circle cx="0" cy="6" r="2.6" class="icf"/><path d="M-7 0a10 10 0 0 1 14 0M-12 -6a17 17 0 0 1 24 0" class="ic"/>';
      case 'cloud':
        return '<path d="M-12 7a6 6 0 0 1 0-12a9 9 0 0 1 17-3a7 7 0 0 1 8 15z" class="ic"/>';
    }
    return '';
  }
  function svgEl(tag, attrs, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function defNodeSvg(n) {
    return `<g class="node ${n.bad ? 'atk' : ''}" data-id="${n.id}" transform="translate(${n.x} ${n.y})">
    <rect x="-52" y="-36" width="104" height="72" rx="8"/><g transform="translate(0 -14)">${iconSvg(n.type)}</g>
    <text class="nl" y="16" text-anchor="middle">${esc(n.label)}</text><text class="ns" y="29" text-anchor="middle">${esc(n.sub)}</text></g>`;
  }
  function linksSvg(sc) {
    const N = id => sc.nodes.find(n => n.id === id);
    return sc.links
      .map(l => {
        const a = N(l[0]),
          b = N(l[1]);
        return `<line class="lk ${l[2] === 'wl' ? 'wl' : ''}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
      })
      .join('');
  }
  function topoHtml(sc) {
    if (sc.id === 'imp') return topoHtmlImp(sc);
    if (sc.id === 'ddos') return topoHtmlDdos(sc);
    const nodes = sc.nodes.map(defNodeSvg).join('');
    return `<svg class="topo" viewBox="0 0 720 400" role="img" aria-label="Topologi jaringan: ${esc(sc.title)}">${linksSvg(sc)}${nodes}<g id="pktLayer"></g></svg>`;
  }

  /* --- Visual khusus skenario DDoS: kerumunan bot dan gauge beban server --- */
  const ddosBots = (() => {
    let seed = 7;
    const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const a = [];
    for (let i = 0; i < 110; i++) {
      const t = r() * Math.PI * 2,
        d = Math.sqrt(r());
      a.push([Math.cos(t) * d * 84, Math.sin(t) * d * 66]);
    }
    return a;
  })();
  function botnetSwarmSvg(n) {
    const dots = ddosBots
      .map(
        (b, i) =>
          `<circle class="bot-dot" cx="${b[0].toFixed(1)}" cy="${b[1].toFixed(1)}" r="${(2.2 + (i % 3) * 0.5).toFixed(1)}" style="animation-delay:${((i * 0.37) % 1.3).toFixed(2)}s"/>`
      )
      .join('');
    return `<g class="node botswarm" data-id="${n.id}" transform="translate(${n.x} ${n.y})">${dots}
    <text class="nl" y="92" text-anchor="middle">${esc(n.label)}</text>
    <text class="ns" y="105" text-anchor="middle">${esc(n.sub)}</text></g>`;
  }
  let ddosFlow = null,
    ddosRAF = 0,
    ddosParts = [];
  function ddosTick() {
    const layer = $('#floodLayer');
    if (!layer || sim.sc.id !== 'ddos' || !ddosFlow) {
      ddosParts.forEach(p => p.el.remove());
      ddosParts = [];
      ddosRAF = 0;
      return;
    }
    const N = id => sim.sc.nodes.find(n => n.id === id),
      bn = N('botnet'),
      net = N('net'),
      sc = N('scrub'),
      sv = N('server');
    const f = ddosFlow;
    for (let k = 0; k < f.rate && ddosParts.length < 320; k++) {
      const b = ddosBots[Math.floor(Math.random() * ddosBots.length)];
      const pts = [
        [bn.x + b[0], bn.y + b[1]],
        [net.x, net.y],
        [sc.x, sc.y],
        [sv.x - 40, sv.y]
      ];
      const el = svgEl('circle', { class: 'fl', r: 2.4 });
      layer.appendChild(el);
      ddosParts.push({
        el,
        pts,
        i: 0,
        t: 0,
        sp: 0.012 + Math.random() * 0.01,
        die: f.die >= 0 && Math.random() < f.dieP ? f.die : 99
      });
    }
    ddosParts = ddosParts.filter(p => {
      p.t += p.sp;
      if (p.t >= 1) {
        p.t = 0;
        p.i++;
        if (p.i >= p.pts.length - 1 || p.i >= p.die) {
          p.el.remove();
          return false;
        }
      }
      const a = p.pts[p.i],
        b = p.pts[p.i + 1];
      p.el.setAttribute('cx', a[0] + (b[0] - a[0]) * p.t);
      p.el.setAttribute('cy', a[1] + (b[1] - a[1]) * p.t);
      return true;
    });
    ddosRAF = requestAnimationFrame(ddosTick);
  }
  function gaugeSvg(n) {
    const R = 34,
      C = (2 * Math.PI * R).toFixed(1);
    return `<g class="node gauge ok" data-id="${n.id}" transform="translate(${n.x} ${n.y})">
    <circle class="g-track" r="${R}" fill="none" stroke-width="8"/>
    <circle class="g-arc" id="gaugeArc" r="${R}" fill="none" stroke-width="8" stroke-dasharray="${C} ${C}" stroke-dashoffset="${C}" transform="rotate(-90)"/>
    <text class="g-val" id="gaugeVal" y="6" text-anchor="middle">0%</text>
    <text class="nl" y="58" text-anchor="middle">${esc(n.label)}</text>
    <text class="ns" id="gaugeSub" y="72" text-anchor="middle">${esc(n.sub)}</text></g>`;
  }
  function shieldSvg(n) {
    return `<g class="node shield" id="scrubShield" data-id="${n.id}" transform="translate(${n.x} ${n.y})">
    <path class="sh-body" d="M0 -30 L26 -18 V6 C26 26 12 36 0 42 C-12 36 -26 26 -26 6 V-18 Z"/>
    <path class="sh-check" d="M-11 2 L-3 12 L13 -10"/>
    <text class="nl" y="58" text-anchor="middle">${esc(n.label)}</text>
    <text class="ns" y="72" text-anchor="middle">${esc(n.sub)}</text></g>`;
  }
  function topoHtmlDdos(sc) {
    const nodes = sc.nodes
      .map(n => {
        if (n.id === 'botnet') return botnetSwarmSvg(n);
        if (n.id === 'server') return gaugeSvg(n);
        if (n.id === 'scrub') return shieldSvg(n);
        return defNodeSvg(n);
      })
      .join('');
    return `<svg class="topo ddos" viewBox="0 0 720 400" role="img" aria-label="Simulasi beban DDoS: ${esc(sc.title)}">${linksSvg(sc)}${nodes}<g transform="translate(240 322)"><text class="ns" y="-8">Link ke origin (kapasitas terbatas)</text><text class="pv" id="linkVal" x="400" y="-8" text-anchor="end">0%</text><rect class="pipe" width="400" height="12" rx="6"/><rect class="pipe-fill" id="linkFill" width="0" height="12" rx="6"/></g><g id="floodLayer"></g><g id="pktLayer"></g></svg>`;
  }

  const POV = {
    idle: { c: 'ok', ms: '–', rps: '–', st: 'Belum dimulai' },
    normal: { c: 'ok', ms: '0,4 dtk', rps: '± 40 /dtk', st: 'Bisa dipakai' },
    filtered: { c: 'ok', ms: '0,9 dtk', rps: '± 90 /dtk (setelah disaring)', st: 'Bisa dipakai' },
    slow: { c: 'slow', ms: '± 6 dtk', rps: '± 5.000 /dtk', st: 'Lambat sekali' },
    weak: { c: 'weak', ms: '± 18 dtk', rps: '± 48.000 /dtk', st: 'Sering error 503' },
    flood: { c: 'down', ms: 'timeout > 30 dtk', rps: '± 480.000 /dtk', st: 'Tidak bisa diakses' }
  };
  const POV_ROWS = [
    ['TC751 Keamanan Jaringan', '3 SKS'],
    ['IF412 Pemrograman Web', '3 SKS'],
    ['IF305 Basis Data', '3 SKS'],
    ['UM101 Bahasa Indonesia', '2 SKS']
  ];
  function povBodyHtml(c) {
    if (c === 'down')
      return `<div class="pov-err"><div class="ico" aria-hidden="true">&#9888;</div><h4>Situs ini tidak dapat dijangkau</h4><p><b>krs.kampus.ac.id</b> terlalu lama merespons.</p><p><code>ERR_CONNECTION_TIMED_OUT</code></p><p><span class="pov-spin"></span>Mencoba menghubungkan ulang&hellip; (mahasiswa lain juga mengalami hal yang sama)</p></div>`;
    const rows = POV_ROWS.map((r, i) => {
      const sk = (c === 'slow' && i >= 1) || (c === 'weak' && i >= 0);
      return sk
        ? `<div class="pov-row"><span class="sk" style="width:${70 - i * 8}%"></span><span class="sk"></span><span class="sk"></span></div>`
        : `<div class="pov-row"><span>${esc(r[0])}</span><span>${esc(r[1])}</span><span aria-hidden="true">&#9745;</span></div>`;
    }).join('');
    const banner =
      c === 'weak'
        ? '<div class="pov-banner">503 Service Unavailable: server sedang sibuk, silakan coba lagi.</div>'
        : '';
    const act =
      c === 'ok'
        ? '<button class="pov-btn" type="button" tabindex="-1">Simpan KRS</button><span class="pov-msg g">Terhubung, KRS siap disimpan.</span>'
        : c === 'slow'
          ? '<button class="pov-btn" type="button" tabindex="-1" disabled>Simpan KRS</button><span class="pov-msg w"><span class="pov-spin"></span>Memuat data mata kuliah&hellip;</span>'
          : '<button class="pov-btn" type="button" tabindex="-1" disabled>Simpan KRS</button><span class="pov-msg w">Gagal menyimpan. Coba lagi nanti.</span>';
    return `${banner}<div class="pov-top"><strong>Portal KRS Semester Ganjil</strong><small>Mahasiswa: Budi Santoso</small></div>${rows}<div class="pov-act">${act}</div>`;
  }
  function renderDdosPov(key, ex) {
    const box = $('#ddosPov');
    if (!box) return;
    const d = Object.assign({}, POV[key] || POV.idle),
      c = d.c;
    if (ex) {
      d.rps = ex.rps;
      d.st = d.st + ' (' + ex.succ + '% berhasil)';
    }
    box.innerHTML = `<div class="pov-h"><b>Tampilan browser mahasiswa</b><span>Apa yang dilihat pengguna sah saat membuka portal</span></div>
    <div class="pov ${c}"><div class="pov-bar"><span class="pov-dots"><i></i><i></i><i></i></span><span class="pov-url">https://krs.kampus.ac.id</span><span class="pov-ms">${esc(d.ms)}</span></div>
    <div class="pov-load"><i></i></div><div class="pov-body">${povBodyHtml(c)}</div>
    <div class="pov-stats"><div>Waktu muat<b>${esc(d.ms)}</b></div><div>Request masuk server<b>${esc(d.rps)}</b></div><div>Status bagi mahasiswa<b class="st">${esc(d.st)}</b></div></div></div>`;
    const bar = box.querySelector('.pov-load i');
    if (bar) {
      bar.style.width = '0';
      void bar.offsetWidth;
      bar.style.width = '';
    }
  }
  function updateDdosVisual(step) {
    const pv = $('#ddosPov');
    if (pv) pv.hidden = sim.sc.id !== 'ddos';
    const topo = $('#topoWrap .topo');
    if (!topo || sim.sc.id !== 'ddos') return;
    {
      const d0 = step && step.ddos;
      renderDdosPov(d0 ? d0.pov : 'idle', d0);
    }
    const shield = topo.querySelector('#scrubShield');
    if (shield) shield.classList.toggle('active', sim.mits.has('scrub'));
    topo.classList.toggle('armed', !!(step && step.ddos && step.ddos.flow));
    ddosFlow = step && step.ddos && step.ddos.flow && !reduce ? step.ddos.flow : null;
    if (ddosFlow && !ddosRAF) ddosRAF = requestAnimationFrame(ddosTick);
    const arc = topo.querySelector('#gaugeArc'),
      val = topo.querySelector('#gaugeVal'),
      sub = topo.querySelector('#gaugeSub'),
      g = topo.querySelector('.node.gauge');
    if (!arc || !g) return;
    const d = (step && step.ddos) || { load: 10, link: 4 },
      R = 34,
      C = 2 * Math.PI * R;
    const lf = topo.querySelector('#linkFill'),
      lv = topo.querySelector('#linkVal');
    if (lf) {
      lf.setAttribute('width', ((400 * d.link) / 100).toFixed(1));
      lf.setAttribute(
        'class',
        'pipe-fill' + (d.link >= 100 ? ' bad' : d.link >= 70 ? ' warn' : '')
      );
    }
    if (lv) lv.textContent = d.link + '%';
    arc.setAttribute('stroke-dashoffset', (C * (1 - d.load / 100)).toFixed(1));
    if (val) val.textContent = d.load + '%';
    if (sub)
      sub.textContent =
        d.load >= 90 ? 'Kapasitas habis' : d.load >= 50 ? 'Beban tinggi' : 'Beban normal';
    g.classList.remove('ok', 'warn', 'bad');
    g.classList.add(d.load >= 90 ? 'bad' : d.load >= 50 ? 'warn' : 'ok');
  }

  /* --- Visual khusus skenario Impersonation (MAC spoofing) --- */
  function impBadgeSvg(n) {
    const isAtk = n.id === 'attacker';
    return `<g class="node badge${isAtk ? ' atk' : ''}" data-id="${n.id}" transform="translate(${n.x} ${n.y})">
    <rect class="card" x="-72" y="-40" width="144" height="80" rx="10"/>
    ${isAtk ? '<g class="seal none" transform="translate(58 -28)"><circle r="8"/><text y="3.5" text-anchor="middle">?</text></g>' : '<g class="seal" transform="translate(58 -28)"><circle r="8"/><path d="M-3.5 0l2.5 2.6 4.5-5"/></g>'}
    <circle class="av" cx="-47" cy="-6" r="15"/>
    <circle class="av-ic" cx="-47" cy="-11" r="4.6"/>
    <path class="av-ic" d="M-58 6c2-7 6-10.5 11-10.5s9 3.5 11 10.5"/>
    <text class="nl" x="8" y="-16" text-anchor="middle">${esc(n.label)}</text>
    <text class="b-mac" x="8" y="2" text-anchor="middle" data-mac="${n.id}">${isAtk ? '\u2013' : esc(MAC.v)}</text>
    <text class="b-tag" x="8" y="19" text-anchor="middle" data-tag="${n.id}">${isAtk ? 'belum tersambung' : 'Fa0/1 \u00b7 terdaftar'}</text>
  </g>`;
  }
  function impSwitchSvg(n) {
    const xs = [-63, -38, -13, 13, 38, 63];
    const ports = xs
      .map((x, i) => {
        const num = i + 1,
          key = num === 1 || num === 5;
        return `<g class="led-port" data-port="p${num}" transform="translate(${x} -4)">
      <rect class="port-body${key ? ' key' : ''}" x="-9" y="-6" width="18" height="12" rx="2"/>
      <circle class="port-led" cx="0" cy="-13" r="3"/>
      <path class="port-lock" d="M-3.3 -13.5v-2.4a3.3 3.3 0 0 1 6.6 0v2.4M-4.4 -13.5h8.8v6h-8.8z" fill="none" stroke="var(--attack)" stroke-width="1.2"/>
      ${key ? `<text class="port-num" y="14" text-anchor="middle">Fa0/${num}</text>` : ''}
    </g>`;
      })
      .join('');
    return `<g class="node swpanel" data-id="${n.id}" transform="translate(${n.x} ${n.y})">
    <rect class="card" x="-95" y="-48" width="190" height="96" rx="10"/>
    <text class="plabel" y="-30" text-anchor="middle">${esc(n.label)}</text>
    ${ports}
    <text class="psub" y="32" text-anchor="middle">port security / 802.1X per-port</text>
  </g>`;
  }
  function topoHtmlImp(sc) {
    const nodes = sc.nodes
      .map(n => {
        if (n.id === 'legit' || n.id === 'attacker') return impBadgeSvg(n);
        if (n.id === 'sw') return impSwitchSvg(n);
        return defNodeSvg(n);
      })
      .join('');
    return `<svg class="topo" viewBox="0 0 720 400" role="img" aria-label="Topologi jaringan: ${esc(sc.title)}">${linksSvg(sc)}${nodes}<g id="cloneLayer"></g><g id="pktLayer"></g></svg>`;
  }
  function impCompareHtml() {
    return `<div class="imp-compare" id="impCompare" hidden>
    <div class="imp-chip" id="impChip1"><span class="imp-chip-l">Fa0/1 &middot; Perangkat resmi</span><span class="imp-chip-mac" id="impMac1">&ndash;</span><span class="imp-chip-s" id="impStat1">&ndash;</span></div>
    <div class="imp-vs" id="impVs"><span class="imp-vs-ic">&ndash;</span></div>
    <div class="imp-chip" id="impChip5"><span class="imp-chip-l">Fa0/5 &middot; Penyerang</span><span class="imp-chip-mac" id="impMac5">&ndash;</span><span class="imp-chip-s" id="impStat5">&ndash;</span></div>
  </div>`;
  }

  const IMP_LOG = {
    idle: [
      ['ok', 'Fa0/1 link up, MAC 00:1A:2B:3C:4D:10 dipelajari (sticky)'],
      ['ok', 'srv-akademik: sesi dari Fa0/1 (komputer lab) diterima']
    ],
    dup: [['warn', 'Fa0/5 link up, MAC 00:1A:2B:3C:4D:10 (sama dengan Fa0/1)']],
    blocked: [
      ['bad', '%PORT_SECURITY-2-PSECURE_VIOLATION Fa0/5: MAC sudah terikat di Fa0/1'],
      ['bad', 'Fa0/5 err-disabled (aksi: shutdown)']
    ],
    rejected: [
      ['warn', 'dot1x Fa0/5: EAP-Start diterima'],
      ['bad', 'RADIUS: EAP-Failure, tidak ada sertifikat perangkat'],
      ['bad', 'Fa0/5 tetap unauthorized']
    ],
    breach: [
      ['bad', 'Fa0/5 diizinkan sebagai 00:1A:2B:3C:4D:10, tanpa pemeriksaan tambahan'],
      ['bad', 'srv-akademik: sesi baru dari MAC yang sama, dianggap perangkat resmi'],
      ['bad', 'GET /akademik/nilai?export=all -> 12.480 baris terkirim']
    ],
    siem: [['warn', 'SIEM ALERT: MAC flapping Fa0/1 <-> Fa0/5, tiket SOC dibuat']]
  };
  let impLeakTimer = 0;
  function impKey(d) {
    return d.state === 'breach' && d.chip5 === 'warn' ? 'siem' : d.state;
  }
  function impSessions(key) {
    const legit =
      '<div class="sess-row ok"><b>Komputer lab (Fa0/1)</b><span>MAC</span><code>00:1A:2B:3C:4D:10</code><span>Status</span><code>sah, sesi normal</code></div>';
    const atk =
      {
        idle: '<div class="sess-row off"><b>Fa0/5</b><span>Status</span><code>belum ada perangkat</code></div>',
        dup: '<div class="sess-row warn"><b>Perangkat di Fa0/5</b><span>MAC</span><code>00:1A:2B:3C:4D:10</code><span>Status</span><code>MAC sama, menunggu keputusan</code></div>',
        blocked:
          '<div class="sess-row ok"><b>Perangkat di Fa0/5</b><span>Status</span><code>port dimatikan, tidak ada sesi</code></div>',
        rejected:
          '<div class="sess-row ok"><b>Perangkat di Fa0/5</b><span>Status</span><code>ditolak 802.1X, tidak ada sesi</code></div>',
        breach:
          '<div class="sess-row bad"><b>Penyerang (Fa0/5)</b><span>MAC</span><code>00:1A:2B:3C:4D:10</code><span>Status</span><code>dikira perangkat resmi</code></div>',
        siem: '<div class="sess-row bad"><b>Penyerang (Fa0/5)</b><span>MAC</span><code>00:1A:2B:3C:4D:10</code><span>Status</span><code>alert SIEM, sesi masih aktif</code></div>'
      }[key] || '';
    return legit + atk;
  }
  function renderImpPov(step) {
    const box = $('#impPov');
    if (!box) return;
    const steps = sim.built ? sim.built.steps : [],
      lines = [];
    let n = 0;
    for (let i = 0; i <= sim.idx && i < steps.length; i++) {
      const d = steps[i].imp;
      if (!d) continue;
      (IMP_LOG[impKey(d)] || []).forEach(l => {
        lines.push([n++, l]);
      });
    }
    const ts = k => {
      const t = 9 * 3600 + 14 * 60 + k * 3;
      return [Math.floor(t / 3600), Math.floor(t / 60) % 60, t % 60]
        .map(x => String(x).padStart(2, '0'))
        .join(':');
    };
    const logHtml = lines.length
      ? lines
          .map(
            ([k, l], i) =>
              `<span class="l ${l[0]}${i === lines.length - 1 ? ' cur' : ''}"><span class="t">${ts(k)}</span>${esc(l[1])}</span>`
          )
          .join('')
      : '<span class="l cur"><span class="t">--:--:--</span>Menunggu simulasi dijalankan</span>';
    const d = step && step.imp,
      key = d ? impKey(d) : 'idle';
    const exposed = key === 'breach' || key === 'siem';
    box.innerHTML = `<div class="pov-h"><b>Sudut pandang administrator</b><span>Log switch dan server internal saat serangan berlangsung</span></div>
   <div class="imp-pov"><div class="cons"><div class="term-h"><i></i><i></i><i></i><span>sw-akses# show logging | srv-akademik</span></div><div class="term-b" id="impTermB">${logHtml}</div></div>
   <div class="sess"><h4>Siapa yang dilihat server?</h4>${impSessions(key)}
   <div class="leak${exposed ? ' hot' : ''}"><small>Data akademik terekspos</small><b id="impLeak">0</b> <small style="display:inline">baris</small><div class="bar"><i id="impLeakBar"></i></div></div></div></div>`;
    const tb = $('#impTermB');
    if (tb) tb.scrollTop = tb.scrollHeight;
    clearInterval(impLeakTimer);
    const out = $('#impLeak'),
      bar = $('#impLeakBar');
    if (!out) return;
    const set = v => {
      out.textContent = v.toLocaleString('id-ID');
      bar.style.width = (v / 12480) * 100 + '%';
    };
    if (!exposed) {
      set(0);
      return;
    }
    if (key === 'siem' || reduce) {
      set(12480);
      return;
    }
    let v = 0;
    const tk = sim.token;
    impLeakTimer = setInterval(() => {
      if (tk !== sim.token || sim.sc.id !== 'imp') {
        clearInterval(impLeakTimer);
        return;
      }
      v = Math.min(12480, v + Math.round(300 + Math.random() * 500));
      set(v);
      if (v >= 12480) clearInterval(impLeakTimer);
    }, 60);
  }
  function impCloneFly() {
    if (reduce) return;
    const topo = $('#topoWrap .topo'),
      L = topo && topo.querySelector('#cloneLayer');
    if (!L) return;
    const a = sim.sc.nodes.find(n => n.id === 'legit'),
      b = sim.sc.nodes.find(n => n.id === 'attacker'),
      tk = sim.token;
    const g = svgEl('g', { class: 'clonecard' });
    g.appendChild(svgEl('rect', { x: -40, y: -14, width: 80, height: 28, rx: 6 }));
    g.appendChild(svgEl('text', { y: 4, 'text-anchor': 'middle' }, '00:1A:..:4D:10'));
    L.appendChild(g);
    let t0 = null;
    const dur = 900;
    const fr = ts => {
      if (tk !== sim.token) {
        g.remove();
        return;
      }
      if (t0 === null) t0 = ts;
      const f = Math.min(1, (ts - t0) / dur),
        e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
      g.setAttribute(
        'transform',
        `translate(${a.x + (b.x - a.x) * e + Math.sin(f * Math.PI) * 70} ${a.y + (b.y - a.y) * e})`
      );
      if (f < 1) requestAnimationFrame(fr);
      else g.remove();
    };
    requestAnimationFrame(fr);
  }
  function updateImpVisual(step) {
    const cmp = $('#impCompare');
    if (!cmp) return;
    const ip = $('#impPov');
    if (ip) ip.hidden = sim.sc.id !== 'imp';
    if (sim.sc.id !== 'imp') {
      cmp.hidden = true;
      return;
    }
    renderImpPov(step);
    cmp.hidden = false;
    const d = (step && step.imp) || {
      mac1: MAC.v,
      mac5: 'belum tersambung',
      tag1: 'Fa0/1 \u00b7 terdaftar',
      tag5: 'belum tersambung',
      state: 'idle'
    };
    const vs = $('#impVs'),
      c1 = $('#impChip1'),
      c5 = $('#impChip5');
    $('#impMac1').textContent = d.mac1;
    $('#impMac5').textContent = d.mac5;
    $('#impStat1').textContent = d.tag1;
    $('#impStat5').textContent = d.tag5;
    c1.className = 'imp-chip ' + (d.chip1 || '');
    c5.className = 'imp-chip ' + (d.chip5 || '');
    const vsMap = {
      idle: ['\u2013', ''],
      dup: ['=', 'dup'],
      blocked: ['\u2715', 'ok'],
      rejected: ['\u2715', 'ok'],
      breach: ['\u26a0', 'dup']
    };
    const [vsIc, vsCls] = vsMap[d.state] || ['\u2013', ''];
    vs.innerHTML = `<span class="imp-vs-ic">${vsIc}</span>`;
    vs.className = 'imp-vs ' + vsCls;
    const topo = $('#topoWrap .topo');
    if (!topo) return;
    $$('.led-port', topo).forEach(p => p.classList.remove('ok', 'bad', 'warn', 'dup'));
    const p1 = topo.querySelector('[data-port="p1"]'),
      p5 = topo.querySelector('[data-port="p5"]');
    if (p1) p1.classList.add('ok');
    if (p5 && d.led5) p5.classList.add(d.led5);
    const macLegit = topo.querySelector('.b-mac[data-mac="legit"]'),
      macAtk = topo.querySelector('.b-mac[data-mac="attacker"]');
    const tagLegit = topo.querySelector('.b-tag[data-tag="legit"]'),
      tagAtk = topo.querySelector('.b-tag[data-tag="attacker"]');
    if (macLegit) macLegit.textContent = d.mac1;
    if (macAtk) macAtk.textContent = d.mac5;
    if (tagLegit) tagLegit.textContent = d.tag1;
    if (tagAtk) tagAtk.textContent = d.tag5;
    const badgeAtk = topo.querySelector('.badge[data-id="attacker"]');
    if (badgeAtk) {
      badgeAtk.classList.remove('bad', 'ok', 'clone');
      if (d.badgeAtk) badgeAtk.classList.add(d.badgeAtk);
      if (d.flash) {
        impCloneFly();
        badgeAtk.classList.add('clone');
        setTimeout(() => badgeAtk.classList.remove('clone'), 900);
      }
    }
  }

  function renderLab2(labId) {
    const cfg = SIMLABS[labId];
    simLab = labId;
    $('#lab2').setAttribute('aria-label', cfg.title);
    $('#lab2').innerHTML =
      labHead(cfg.title, cfg.ind, cfg.intro) +
      (cfg.list.length > 1
        ? '<div class="sc-tabs" id="scTabs" role="group" aria-label="Pilih skenario"></div>'
        : '') +
      `<p class="scintro" id="scIntro"${cfg.list.length > 1 ? '' : ' style="margin-top:28px"'}></p>
  <div class="sim">
    <section class="panel"><h3>Mitigasi</h3><div class="mit-row" id="mitBox"></div><div id="lvlBox"></div><div class="mit-desc" id="mitDesc"></div></section>
    <section class="panel"><div class="ctl" id="simCtl"></div>${impCompareHtml()}<div class="topo-wrap" id="topoWrap"></div><div class="pov-wrap" id="ddosPov" hidden></div><div class="pov-wrap" id="impPov" hidden></div>
      <div class="pk-legend"><span style="--c:var(--accent)">Lalu lintas normal</span><span style="--c:var(--attack)">Lalu lintas serangan</span><span style="--c:var(--warn)">Paket dibuang atau ditolak</span></div>
      <div class="cap" id="capBox" aria-live="polite"></div></section>
    <section class="panel"><div class="seg-tabs" id="dtTabs"><button type="button" data-dt="tables" aria-pressed="true">Status perangkat</button><button type="button" data-dt="log" aria-pressed="false">Riwayat langkah</button></div>
      <div id="tblBox"></div><ol class="log" id="logBox" hidden></ol></section>
    <section class="panel" id="outBox" hidden></section>
  </div>`;
    selectScenario(cfg.list[0]);
  }
  function renderTabs() {
    const box = $('#scTabs');
    if (!box) return;
    box.innerHTML = SIMLABS[simLab].list
      .map(id => {
        const r = P.lab2[id];
        return `<button type="button" data-sc="${id}" aria-pressed="${sim.sc.id === id}">${G(SCEN[id].tab)}${r.bad && r.good ? '<span class="dot" title="Tuntas"></span>' : ''}</button>`;
      })
      .join('');
  }
  $('#lab2').addEventListener('click', e => {
    const b = e.target.closest('button[data-sc]');
    if (b) selectScenario(b.dataset.sc);
  });
  $('#lab2').addEventListener('click', e => {
    const b = e.target.closest('button[data-dt]');
    if (!b) return;
    $$('#dtTabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#tblBox').hidden = b.dataset.dt !== 'tables';
    $('#logBox').hidden = b.dataset.dt !== 'log';
  });
  function selectScenario(id) {
    sim.sc = SCEN[id];
    sim.mits = new Set();
    $('#scIntro').innerHTML = G(sim.sc.intro);
    $('#topoWrap').innerHTML = topoHtml(sim.sc);
    $('#mitBox').innerHTML = sim.sc.mits
      .map(
        m =>
          `<label class="mit"><input type="checkbox" value="${m.id}"><span>${G(m.name)}</span></label>`
      )
      .join('');
    $$('#mitBox input').forEach(inp =>
      inp.addEventListener('change', () => {
        inp.checked ? sim.mits.add(inp.value) : sim.mits.delete(inp.value);
        renderMitDesc();
        resetSim();
      })
    );
    $('#lvlBox').innerHTML = id === 'ddos' ? ddosLvlHtml() : '';
    renderMitDesc();
    renderTabs();
    resetSim();
  }
  function ddosLvlHtml() {
    return `<div class="lvl"><span class="lvl-l">Skala serangan</span><div class="lvl-b" role="group" aria-label="Skala serangan">${DDOS_LV.map((l, i) => `<button type="button" data-lvl="${i}" aria-pressed="${(sim.ddosLvl || 0) === i}">${l.n}</button>`).join('')}</div></div>`;
  }
  $('#lab2').addEventListener('click', e => {
    const b = e.target.closest('button[data-lvl]');
    if (!b) return;
    sim.ddosLvl = +b.dataset.lvl;
    $$('#lvlBox button').forEach(x => x.setAttribute('aria-pressed', x === b));
    resetSim();
  });
  function renderMitDesc() {
    const on = sim.sc.mits.filter(m => sim.mits.has(m.id));
    $('#mitDesc').innerHTML = on.length
      ? on.map(m => `<p><b>${G(m.name)}.</b> ${G(m.desc)}</p>`).join('')
      : '<p>Belum ada mitigasi aktif. Jalankan dulu tanpa mitigasi untuk melihat dampak penuh serangan.</p>';
  }
  function resetSim() {
    sim.token++;
    sim.idx = -1;
    sim.playing = false;
    sim.busy = false;
    sim.built = sim.sc.run(sim.mits);
    const layer = $('#pktLayer');
    if (layer) layer.innerHTML = '';
    $$('.topo .node').forEach(n => n.classList.remove('bad', 'ok'));
    renderCtl();
    renderLog();
    renderTables(sim.sc.init(sim.mits));
    renderOutcome(false);
    updateImpVisual(null);
    updateDdosVisual(null);
  }
  function renderCtl() {
    const last = sim.built.steps.length - 1,
      done = sim.idx >= last,
      started = sim.idx >= 0;
    $('#simCtl').innerHTML =
      `<button class="btn primary" id="btnPlay" type="button">${sim.playing ? 'Jeda' : done ? 'Jalankan ulang' : started ? 'Lanjutkan otomatis' : 'Jalankan simulasi'}</button>
    <button class="btn" id="btnNext" type="button" ${done || sim.busy || sim.playing ? 'disabled' : ''}>Langkah berikutnya</button>
    <button class="btn" id="btnReset" type="button" ${started ? '' : 'disabled'}>Ulang dari awal</button>
    <span class="step">${started ? `Langkah ${sim.idx + 1} dari ${last + 1}` : `${last + 1} langkah`}</span>`;
    $('#btnPlay').onclick = () => {
      if (sim.playing) {
        sim.playing = false;
        renderCtl();
      } else {
        if (sim.idx >= last) resetSim();
        play();
      }
    };
    $('#btnNext').onclick = () => next();
    $('#btnReset').onclick = () => resetSim();
  }
  function renderLog() {
    const L = $('#logBox'),
      C = $('#capBox');
    const lab = { info: 'Normal', attack: 'Serangan', defense: 'Pertahanan' };
    if (sim.idx < 0) {
      C.innerHTML =
        '<p class="empty">Tekan "Jalankan simulasi" untuk melihat serangan berjalan, atau "Langkah berikutnya" untuk maju satu langkah.</p>';
      L.innerHTML = '<li><span></span><p class="empty">Belum ada langkah.</p></li>';
      return;
    }
    const s = sim.built.steps[sim.idx];
    C.innerHTML = `<span class="tag ${s.kind}">${lab[s.kind]}</span><div class="l-t">${G(s.title)}</div><p>${G(s.msg)}</p>`;
    L.innerHTML = sim.built.steps
      .slice(0, sim.idx + 1)
      .map(
        (s, i) =>
          `<li class="${i === sim.idx ? 'cur' : ''}"><span><span class="tag ${s.kind}">${lab[s.kind]}</span></span><div><div class="l-t">${G(s.title)}</div><p>${G(s.msg)}</p></div></li>`
      )
      .join('');
  }
  function renderTables(tabs) {
    const lab = { ok: 'Normal', bad: 'Teracuni', warn: 'Perhatian' };
    $('#tblBox').innerHTML = tabs
      .map(
        t =>
          `<div class="tbl-block"><p class="tbl-title">${t.title}</p><table class="tbl"><thead><tr>${t.head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${t.rows
            .map(
              r =>
                `<tr class="${r[2]}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td class="st">${esc(r[3] || lab[r[2]])}</td></tr>`
            )
            .join('')}</tbody></table></div>`
      )
      .join('');
  }
  function renderOutcome(show) {
    const o = $('#outBox');
    if (!show) {
      o.hidden = true;
      o.innerHTML = '';
      return;
    }
    o.hidden = false;
    const out = sim.built.outcome,
      names = { C: 'Confidentiality', I: 'Integrity', A: 'Availability' };
    o.innerHTML = `<h3>Hasil</h3><div class="verdict ${out.level}"><strong>${G(out.title)}</strong><p>${G(out.text)}</p></div>
    <p class="discuss"><strong>Pilar CIA terdampak:</strong></p>
    <div class="chips" style="margin-top:6px">${out.cia.length ? out.cia.map(c => `<span class="chip">${c} ${names[c]}</span>`).join('') : '<span class="chip def">Tidak ada, serangan dihentikan</span>'}</div>
    <p class="discuss"><strong>Pertanyaan diskusi.</strong> ${G(sim.sc.discuss)}</p>`;
  }
  function applyMarks(i) {
    const m = {};
    for (let k = 0; k <= i; k++) Object.assign(m, sim.built.steps[k].mark || {});
    $$('.topo .node').forEach(n => {
      n.classList.remove('bad', 'ok');
      const s = m[n.dataset.id];
      if (s) n.classList.add(s);
    });
  }
  async function animatePacket(p, tk) {
    await wait(p.delay || 0);
    const layer = $('#pktLayer');
    if (tk !== sim.token || !layer) return;
    const pts = p.route.map(id => {
      const n = sim.sc.nodes.find(x => x.id === id);
      return [n.x, n.y];
    });
    const g = svgEl('g', { class: 'pkt ' + p.kind });
    g.appendChild(svgEl('circle', { r: 8 }));
    g.appendChild(svgEl('text', { y: -14, 'text-anchor': 'middle' }, p.label || ''));
    if (p.kind === 'block')
      g.appendChild(svgEl('text', { class: 'x', y: 4, 'text-anchor': 'middle' }, '\u2715'));
    layer.appendChild(g);
    const place = (x, y) => g.setAttribute('transform', `translate(${x} ${y})`);
    if (reduce) {
      place(...pts[pts.length - 1]);
      await wait(450);
      g.remove();
      return;
    }
    const seg = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(d);
      total += d;
    }
    const dur = Math.max(900, total / 0.2);
    let t0 = null;
    place(...pts[0]);
    await new Promise(res => {
      function frame(ts) {
        if (tk !== sim.token) {
          g.remove();
          return res();
        }
        if (t0 === null) t0 = ts;
        const f = Math.min(1, (ts - t0) / dur);
        let d = f * total,
          i = 0;
        while (i < seg.length - 1 && d > seg[i]) {
          d -= seg[i];
          i++;
        }
        const r = seg[i] ? d / seg[i] : 1;
        place(
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r,
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r
        );
        if (f < 1) requestAnimationFrame(frame);
        else
          setTimeout(
            () => {
              g.remove();
              res();
            },
            p.kind === 'block' ? 650 : 150
          );
      }
      requestAnimationFrame(frame);
    });
  }
  async function showStep(i) {
    const tk = sim.token,
      st = sim.built.steps[i];
    sim.idx = i;
    renderLog();
    await Promise.all((st.pkts || []).map(p => animatePacket(p, tk)));
    if (tk !== sim.token) return;
    renderTables(st.tables);
    applyMarks(i);
    updateImpVisual(st);
    updateDdosVisual(st);
    if (i === sim.built.steps.length - 1) finishSim();
  }
  async function next() {
    if (sim.busy || sim.idx >= sim.built.steps.length - 1) return;
    const tk = sim.token;
    sim.busy = true;
    renderCtl();
    await showStep(sim.idx + 1);
    if (tk === sim.token) {
      sim.busy = false;
      renderCtl();
    }
  }
  async function play() {
    const tk = sim.token,
      last = sim.built.steps.length - 1;
    sim.playing = true;
    renderCtl();
    while (sim.playing && tk === sim.token && sim.idx < last) {
      await next();
      if (tk !== sim.token) return;
      await wait(reduce ? 250 : 600);
    }
    if (tk === sim.token) {
      sim.playing = false;
      renderCtl();
    }
  }
  function finishSim() {
    const o = sim.built.outcome,
      r = P.lab2[sim.sc.id];
    r.last = {
      level: o.level,
      mits: [...sim.mits].map(id => sim.sc.mits.find(m => m.id === id).name)
    };
    if (o.level === 'bad') r.bad = true;
    else r.good = true;
    renderOutcome(true);
    renderTabs();
    touchProgress();
    const ob = $('#outBox');
    if (ob.scrollIntoView)
      ob.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ================= LAB 3A: Analisis email ================= */
  const EM = [
    {
      id: 'e1',
      from: 'Layanan TI Kampus',
      subject: 'Akun email Anda akan ditutup',
      phish: true,
      type: 'phishing kredensial',
      tip: 'Tindakan yang benar: jangan klik tautan atau buka lampiran, laporkan ke tim TI melalui kanal resmi, lalu hapus pesan.',
      head: [
        {
          k: 'from',
          label: 'Dari',
          t: 'Layanan TI Kampus <no-reply@helpdesk-univ-contoh.co>',
          f: 'Nama tampilan tampak resmi, tetapi domain pengirim (helpdesk-univ-contoh.co) bukan domain resmi kampus (univ-contoh.ac.id).'
        },
        {
          k: 'subj',
          label: 'Subjek',
          t: '[TINDAKAN SEGERA] Akun email Anda akan ditutup dalam 2 jam',
          f: 'Nada mendesak dan mengancam agar korban bertindak tanpa berpikir (urgency).'
        }
      ],
      body: [
        [
          {
            k: 'greet',
            t: 'Yth. Pengguna Layanan,',
            f: 'Sapaan generik. Pesan sah dari institusi biasanya menyebut nama Anda.'
          }
        ],
        [
          { k: 'p1', t: 'Sistem kami mendeteksi aktivitas mencurigakan pada akun Anda.' },
          {
            k: 'p2',
            t: 'Agar akun tidak dinonaktifkan permanen, verifikasi kata sandi Anda sekarang juga melalui tautan berikut:',
            f: 'Layanan TI yang sah tidak pernah meminta verifikasi kata sandi melalui email.'
          }
        ],
        [
          {
            k: 'link',
            t: 'https://mail.univ-contoh.ac.id/verifikasi',
            href: 'http://univ-contoh-ac-id.masuk-akun.co/verify?s=8f3a',
            f: 'Teks tautan tampak resmi, tetapi tujuan sebenarnya (terlihat pada bilah status saat kursor diarahkan) adalah domain lain.'
          }
        ],
        [
          {
            k: 'att',
            t: 'Lampiran: Panduan_Verifikasi_Akun.zip',
            f: 'Lampiran arsip yang tidak diminta pada pesan "verifikasi" sering berisi malware.'
          }
        ],
        [{ k: 'sign', t: 'Hormat kami, Tim Dukungan TI' }]
      ]
    },
    {
      id: 'e2',
      from: 'Dekan Fakultas',
      subject: 'Mohon bantuan pembayaran vendor',
      phish: true,
      type: 'business email compromise',
      tip: 'Verifikasi setiap permintaan keuangan lewat kanal terpisah (telepon ke nomor terdaftar) dan patuhi prosedur persetujuan ganda, siapa pun pengirim yang mengaku.',
      head: [
        {
          k: 'from',
          label: 'Dari',
          t: 'Dekan Fakultas <dekan.fakultas.2026@gmail.com>',
          f: 'Mengaku pimpinan institusi, tetapi memakai alamat email gratis pribadi, bukan email resmi.'
        },
        { k: 'subj', label: 'Subjek', t: 'Mohon bantuan pembayaran vendor' }
      ],
      body: [
        [
          { k: 'greet', t: 'Selamat pagi,' },
          {
            k: 'p1',
            t: 'saya sedang rapat di luar kota dan tidak bisa ditelepon.',
            f: 'Pelaku menutup jalur verifikasi lewat telepon dengan alasan tidak dapat dihubungi.'
          }
        ],
        [
          {
            k: 'p2',
            t: 'Tolong transfer Rp 48.500.000 ke rekening vendor baru berikut hari ini juga:',
            f: 'Permintaan transfer di luar prosedur (tanpa PO dan persetujuan) dengan tenggat mendadak: ciri BEC.'
          }
        ],
        [
          {
            k: 'acc',
            t: 'Bank XYZ 123-456-7890 a.n. PT Mitra Sejahtera',
            f: 'Rekening baru yang tidak diverifikasi ke vendor melalui kanal terpisah.'
          }
        ],
        [
          {
            k: 'secret',
            t: 'Jangan diinformasikan dulu ke bagian keuangan lain, ini bersifat rahasia.',
            f: 'Meminta merahasiakan dari pihak lain untuk menghindari pemeriksaan (isolasi korban).'
          }
        ],
        [{ k: 'thx', t: 'Terima kasih.' }]
      ]
    },
    {
      id: 'e3',
      from: 'Biro Akademik',
      subject: 'Jadwal UTS telah terbit',
      phish: false,
      type: '',
      tip: 'Email ini sah. Tetap biasakan membuka portal dari bookmark sendiri, bukan dari tautan di email, sebagai kebiasaan aman.',
      head: [
        { k: 'from', label: 'Dari', t: 'Biro Akademik <akademik@univ-contoh.ac.id>' },
        { k: 'subj', label: 'Subjek', t: 'Jadwal UTS Semester Ganjil 2026/2027 telah terbit' }
      ],
      body: [
        [{ k: 'greet', t: 'Yth. Budi Santoso (NIM 71260012),' }],
        [
          {
            k: 'p1',
            t: 'Jadwal UTS sudah dapat dilihat di portal akademik seperti biasa. Anda dapat membuka portal langsung dari peramban atau memakai tautan resmi berikut:'
          }
        ],
        [
          {
            k: 'link',
            t: 'https://portal.univ-contoh.ac.id/jadwal',
            href: 'https://portal.univ-contoh.ac.id/jadwal'
          }
        ],
        [
          {
            k: 'p2',
            t: 'Biro Akademik tidak pernah meminta kata sandi melalui email. Jika ada pertanyaan, datanglah ke loket atau hubungi nomor yang tertera di situs resmi.'
          }
        ],
        [{ k: 'thx', t: 'Terima kasih.' }]
      ]
    }
  ];
  const M = { cur: 0, st: {} };
  EM.forEach(e => {
    M.st[e.id] = { marks: new Set(), done: false, res: null };
  });
  const STATUS_DEFAULT = 'Arahkan kursor atau ketuk tautan untuk melihat alamat tujuan sebenarnya.';

  function segHtml(p, st) {
    const cls = ['seg'];
    if (p.href) cls.push('lnk');
    const marked = st.marks.has(p.k);
    if (marked) cls.push('marked');
    if (st.done) {
      if (p.f && marked) cls.push('hit');
      else if (p.f) cls.push('miss');
      else if (marked) cls.push('fp');
    }
    return `<button type="button" class="${cls.join(' ')}" data-k="${p.k}" ${p.href ? `data-href="${esc(p.href)}"` : ''} aria-pressed="${marked}" ${st.done ? 'aria-disabled="true"' : ''}>${esc(p.t)}</button>`;
  }
  function renderLab3() {
    $('#lab3').innerHTML =
      labHead(
        'Social engineering dan pertahanan berlapis',
        'Mengevaluasi efektivitas strategi manajemen jaringan dan pertahanan terhadap social engineering.',
        'Kenali email phishing, lalu susun pertahanan berlapis dengan anggaran terbatas.'
      ) +
      `<div class="seg-tabs" id="p3Tabs" style="margin-top:28px"><button type="button" data-p3="mail" aria-pressed="true">Bagian 1: Analisis email</button><button type="button" data-p3="def" aria-pressed="false">Bagian 2: Pertahanan berlapis</button></div>
  <div class="panel" id="p3mail"><p class="hint">Klik bagian pesan yang menurut Anda mencurigakan, lalu tentukan: phishing atau sah. Salah satu dari tiga email itu sah.</p>
    <div class="inbox" id="inbox"></div><div id="mailPane"></div></div>
  <div class="panel" id="p3def" hidden><p class="hint">Pilih kontrol dengan anggaran 10 poin. Targetnya: risiko terburuk tetap di bawah atau sama dengan 1% bila satu lapisan gagal.</p>
    <div class="def-grid"><div><div class="budget"><span>Anggaran terpakai</span><span id="budTxt"></span></div><div class="meter" id="budBar"><i></i></div><div id="defCtrls"></div></div>
    <div id="defView"></div></div></div>`;
    drawInbox();
    drawMail();
    initDefense();
  }
  function drawInbox() {
    $('#inbox').innerHTML = EM.map((e, i) => {
      const r = M.st[e.id].res;
      return `<button type="button" data-i="${i}" ${i === M.cur ? 'aria-current="true"' : ''}>Email ${i + 1}<span class="i-r ${r ? (r.correct ? 'good' : 'bad') : ''}">${r ? (r.correct ? '\u2713 Tepat' : '\u2715 Keliru') : ''}</span></button>`;
    }).join('');
  }
  $('#lab3').addEventListener('click', e => {
    const b = e.target.closest('#inbox button');
    if (b) {
      M.cur = +b.dataset.i;
      drawInbox();
      drawMail();
    }
  });
  $('#lab3').addEventListener('click', e => {
    const b = e.target.closest('button[data-p3]');
    if (!b) return;
    $$('#p3Tabs button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#p3mail').hidden = b.dataset.p3 !== 'mail';
    $('#p3def').hidden = b.dataset.p3 !== 'def';
  });
  function drawMail() {
    const m = EM[M.cur],
      st = M.st[m.id];
    $('#mailPane').innerHTML = `<div class="mail">
    <div class="mail-head">${m.head.map(h => `<div class="mh"><span class="mh-l">${h.label}</span>${segHtml(h, st)}</div>`).join('')}</div>
    <div class="mail-body">${m.body.map(par => `<p>${par.map(p => segHtml(p, st)).join(' ')}</p>`).join('')}</div>
    <div class="statusbar" id="statusbar">${STATUS_DEFAULT}</div></div>
    <div class="decide"><button class="btn primary" id="decPhish" type="button" ${st.done ? 'disabled' : ''}>Laporkan sebagai phishing</button>
    <button class="btn" id="decLegit" type="button" ${st.done ? 'disabled' : ''}>Email ini sah</button><span class="count" id="markCount">Ditandai: ${st.marks.size}</span></div>
    <div id="mailFb" aria-live="polite"></div>`;
    if (st.done) drawMailFb();
    $('#decPhish').onclick = () => evalMail(true);
    $('#decLegit').onclick = () => evalMail(false);
  }
  $('#lab3').addEventListener('click', e => {
    const s = e.target.closest('.seg');
    if (!s || !$('#mailPane').contains(s)) return;
    const st = M.st[EM[M.cur].id];
    if (s.dataset.href) $('#statusbar').textContent = 'Tujuan tautan: ' + s.dataset.href;
    if (st.done) return;
    const k = s.dataset.k;
    if (st.marks.has(k)) st.marks.delete(k);
    else st.marks.add(k);
    s.classList.toggle('marked', st.marks.has(k));
    s.setAttribute('aria-pressed', st.marks.has(k));
    $('#markCount').textContent = 'Ditandai: ' + st.marks.size;
  });
  function hoverStatus(e, on) {
    const s = e.target.closest && e.target.closest('.seg[data-href]');
    if (!s || !$('#statusbar')) return;
    $('#statusbar').textContent = on ? 'Tujuan tautan: ' + s.dataset.href : STATUS_DEFAULT;
  }
  $('#lab3').addEventListener('mouseover', e => hoverStatus(e, true));
  $('#lab3').addEventListener('mouseout', e => hoverStatus(e, false));
  $('#lab3').addEventListener('focusin', e => hoverStatus(e, true));
  $('#lab3').addEventListener('focusout', e => hoverStatus(e, false));

  function allParts(m) {
    return m.head.concat(...m.body);
  }
  function evalMail(decPhish) {
    const m = EM[M.cur],
      st = M.st[m.id];
    const flags = allParts(m).filter(p => p.f);
    const found = flags.filter(p => st.marks.has(p.k)).length;
    const fp = [...st.marks].filter(k => !flags.some(p => p.k === k)).length;
    st.done = true;
    st.res = {
      correct: decPhish === m.phish,
      decision: decPhish ? 'phishing' : 'sah',
      found,
      total: flags.length,
      fp
    };
    P.lab3.emails[m.id] = st.res;
    drawInbox();
    drawMail();
    touchProgress();
  }
  function drawMailFb() {
    const m = EM[M.cur],
      st = M.st[m.id],
      r = st.res,
      flags = allParts(m).filter(p => p.f);
    const verdict = m.phish ? `Email ini adalah phishing (${G(m.type)}).` : 'Email ini sah.';
    $('#mailFb').innerHTML =
      `<div class="fb ${r.correct ? 'good' : 'bad'}"><strong>${r.correct ? 'Keputusan tepat.' : 'Keputusan kurang tepat.'}</strong> ${verdict}
    ${m.phish ? `<p>Indikator ditemukan: ${r.found} dari ${r.total}${r.fp ? `. Tanda yang keliru: ${r.fp}` : ''}.</p>` : `<p>${r.fp ? `Anda menandai ${r.fp} bagian, padahal tidak ada indikator phishing: pengirim, tautan, dan permintaan sesuai prosedur.` : 'Tidak ada indikator phishing: pengirim, tautan, dan permintaan sesuai prosedur.'}</p>`}</div>
    ${flags.length ? `<ul class="flaglist">${flags.map(p => `<li class="${st.marks.has(p.k) ? 'hit' : 'miss'}"><b>${st.marks.has(p.k) ? 'Ditemukan' : 'Terlewat'}:</b> <q>${esc(p.t)}</q> ${G(p.f)}</li>`).join('')}</ul>` : ''}
    <p style="margin:0 0 10px">${G(m.tip)}</p><button class="btn" id="mailRetry" type="button">Coba lagi email ini</button>`;
    $('#mailRetry').onclick = () => {
      M.st[m.id] = { marks: new Set(), done: false, res: null };
      delete P.lab3.emails[m.id];
      drawInbox();
      drawMail();
      touchProgress();
    };
  }

  /* ================= LAB 3B: Pertahanan berlapis ================= */
  const STAGES = [
    { id: 's1', name: 'Email phishing sampai ke kotak masuk', base: 0.9 },
    { id: 's2', name: 'Karyawan mengklik dan memasukkan kredensial', base: 0.35 },
    { id: 's3', name: 'Penyerang berhasil login dengan kredensial curian', base: 0.9 },
    { id: 's4', name: 'Penyerang bergerak lateral ke server penting', base: 0.8 },
    { id: 's5', name: 'Data berhasil dikirim keluar (eksfiltrasi)', base: 0.9 }
  ];
  const CTRL = [
    {
      id: 'filter',
      name: 'Filter email dan anti-phishing',
      cost: 3,
      fx: { s1: 0.3 },
      tip: 'SPF, DKIM, DMARC, sandbox lampiran.'
    },
    {
      id: 'train',
      name: 'Kebijakan dan pelatihan kesadaran',
      cost: 2,
      fx: { s2: 0.4 },
      tip: 'Simulasi phishing berkala dan budaya melapor.'
    },
    {
      id: 'mfa',
      name: 'Autentikasi multi-faktor',
      cost: 2,
      fx: { s3: 0.15 },
      tip: 'Kata sandi curian saja tidak cukup untuk masuk.'
    },
    {
      id: 'seg',
      name: 'Segmentasi jaringan dan least privilege',
      cost: 4,
      fx: { s4: 0.25 },
      tip: 'VLAN, ACL, dan zone-based security.'
    },
    {
      id: 'edr',
      name: 'Perlindungan endpoint (EDR)',
      cost: 3,
      fx: { s4: 0.6, s5: 0.6 },
      tip: 'Mendeteksi perilaku lateral movement dan pengiriman data.'
    },
    {
      id: 'siem',
      name: 'Monitoring SIEM dan respons insiden',
      cost: 3,
      fx: { s5: 0.4 },
      tip: 'Korelasi log dan alert terpusat.'
    }
  ];
  const BUDGET = 10,
    GOAL = 0.01;
  const act = new Set();
  function riskOf(a) {
    const per = STAGES.map(s => {
      let p = s.base;
      CTRL.forEach(c => {
        if (a.has(c.id) && c.fx[s.id]) p *= c.fx[s.id];
      });
      return p;
    });
    return { per, total: per.reduce((x, y) => x * y, 1) };
  }
  function worstCase(a) {
    if (!a.size) return { total: riskOf(a).total, id: null };
    let w = { total: -1, id: null };
    a.forEach(id => {
      const b = new Set(a);
      b.delete(id);
      const r = riskOf(b).total;
      if (r > w.total) w = { total: r, id };
    });
    return w;
  }
  function initDefense() {
    $('#defCtrls').innerHTML = CTRL.map(
      c =>
        `<label class="ctrl"><input type="checkbox" value="${c.id}"><span><b>${G(c.name)}</b><small>${G(c.tip)}</small></span><span class="cost">${c.cost} poin</span></label>`
    ).join('');
    $$('#defCtrls input').forEach(i =>
      i.addEventListener('change', () => {
        i.checked ? act.add(i.value) : act.delete(i.value);
        drawDefense();
      })
    );
    drawDefense();
  }
  function drawDefense() {
    const cost = [...act].reduce((s, id) => s + CTRL.find(c => c.id === id).cost, 0);
    $('#budTxt').textContent = `${cost} / ${BUDGET} poin`;
    $('#budBar').className = 'meter' + (cost > BUDGET ? ' over' : '');
    $('#budBar i').style.width = Math.min(100, (cost / BUDGET) * 100) + '%';
    const r = riskOf(act),
      base = riskOf(new Set()).total,
      w = worstCase(act);
    const wName = w.id ? CTRL.find(c => c.id === w.id).name : null;
    const okGoal = cost <= BUDGET && act.size > 0 && w.total <= GOAL;
    $('#defView').innerHTML =
      STAGES.map((s, i) => {
        const chips = CTRL.filter(c => act.has(c.id) && c.fx[s.id])
          .map(c => `<span class="chip def">${G(c.name)}</span>`)
          .join('');
        return `<div class="stage"><div class="stage-h"><span>${G(s.name)}</span><span class="p">${pct(r.per[i])}</span></div>
      <div class="bar" role="img" aria-label="Peluang tahap lolos ${pct(r.per[i])}"><i style="width:${(r.per[i] * 100).toFixed(1)}%"></i></div>
      ${chips ? `<div class="chips">${chips}</div>` : ''}</div>`;
      }).join('') +
      `<dl class="risk-box"><div><dt>Peluang serangan tuntas</dt><dd>${pct(r.total)}<small>Tanpa kontrol: ${pct(base)}</small></dd></div>
     <div><dt>Risiko terburuk bila satu lapisan gagal</dt><dd>${pct(w.total)}<small>${wName ? 'Jika gagal: ' + wName : 'Belum ada lapisan aktif'}</small></dd></div></dl>
     <div class="fb ${okGoal ? 'good' : 'bad'} goal"><strong>${okGoal ? 'Target tercapai.' : 'Target belum tercapai.'}</strong>
     <p>${G(okGoal ? 'Pertahanan Anda tetap kuat walau satu lapisan gagal. Inilah inti defense in depth.' : cost > BUDGET ? 'Anggaran terlampaui. Kurangi kontrol atau pilih yang lebih murah.' : 'Buat risiko terburuk ≤ 1% dengan anggaran ≤ 10 poin. Petunjuk: satu lapisan yang sangat kuat tetap menjadi titik kegagalan tunggal.')}</p></div>`;
    P.lab3.defense.layers = [...act];
    P.lab3.defense.cost = cost;
    P.lab3.defense.risk = r.total;
    P.lab3.defense.worst = w.total;
    if (okGoal) P.lab3.defense.ok = true;
    touchProgress();
  }

  /* ================= Mulai ================= */
  renderLab1();
  renderLab3();
  showLab('lab1');
})();