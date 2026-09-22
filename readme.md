I generated the README content, but I couldn’t commit it because this session does not have write permission for `Hydrophael/networkdefense`.

````markdown name=README.md
# Lab Keamanan Jaringan TC751

Lab interaktif berbasis web untuk mempelajari konsep dasar keamanan jaringan melalui kuis, simulasi serangan, dan latihan memilih kontrol pertahanan. Materi dan antarmuka menggunakan bahasa Indonesia dengan contoh yang berorientasi pada lingkungan kampus.

## Fitur

- **Triad CIA** — klasifikasikan insiden berdasarkan _Confidentiality_, _Integrity_, atau _Availability_.
- **Simulasi spoofing dan rogue system**:
  - ARP spoofing dan man-in-the-middle
  - Rogue DHCP server
  - Rogue access point (_evil twin_)
- **Simulasi DDoS** — amati dampak botnet terhadap link, kapasitas server, dan pengguna sah.
- **Impersonation melalui MAC spoofing** — bandingkan kondisi tanpa kontrol, port security, 802.1X, dan monitoring SIEM.
- **Analisis email** — identifikasi phishing, business email compromise, dan email yang sah.
- **Perencanaan defense in depth** — pilih kontrol keamanan dengan anggaran terbatas dan ukur risiko ketika salah satu lapisan gagal.
- **Mode terang dan gelap** — mengikuti preferensi sistem atau pilihan pengguna.
- **Glossary interaktif** — istilah teknis diberi penjelasan singkat untuk pembelajar pemula.
- **Aksesibilitas dasar** — dukungan keyboard, `:focus-visible`, skip link, label ARIA, dan reduced motion.
- **Tanpa backend dan tanpa paket eksternal** — seluruh aplikasi berjalan di browser.

## Struktur Repository

```text
.
├── index.html   # Struktur halaman dan titik mount konten
├── script.js    # Materi, state, kuis, simulator, visualisasi SVG, dan interaksi
├── style.css    # Tata letak, tema, komponen UI, animasi, dan visualisasi
└── README.md    # Dokumentasi proyek
```

## Cara Menjalankan

Proyek ini adalah situs statis sehingga tidak memerlukan instalasi dependency atau proses build.

### Membuka langsung

Buka `index.html` menggunakan browser modern.

### Menggunakan server lokal

Server lokal direkomendasikan agar perilaku browser lebih konsisten:

```bash
python3 -m http.server 8000
```

Kemudian buka <http://localhost:8000>.

Alternatif menggunakan Node.js:

```bash
npx serve .
```

## Alur Pembelajaran

1. Mulai dari **Triad CIA dan klasifikasi ancaman**.
2. Jalankan skenario pada **Spoofing dan rogue system** tanpa mitigasi.
3. Aktifkan kontrol keamanan dan jalankan ulang simulasi untuk membandingkan hasilnya.
4. Pelajari **DDoS** dengan beberapa skala serangan dan kombinasi mitigasi.
5. Gunakan **Impersonation (MAC spoofing)** untuk memahami keterbatasan alamat MAC sebagai identitas.
6. Selesaikan **Analisis email**.
7. Susun kombinasi kontrol pada bagian **Pertahanan berlapis**.

## Model Simulasi

Simulasi bersifat edukatif dan visual, bukan emulasi jaringan nyata. Aplikasi tidak mengirim paket ke jaringan.

- **ARP spoofing** memodelkan keracunan cache ARP dan dampak DAI, entri ARP statis, serta HTTPS/TLS.
- **Rogue DHCP** memodelkan DHCP snooping, 802.1X/NAC, dan deteksi melalui SIEM.
- **Evil twin** memodelkan validasi sertifikat WPA2/WPA3-Enterprise, Wireless IPS, dan VPN always-on.
- **DDoS** menggunakan model kapasitas sederhana untuk membandingkan scrubbing/CDN, rate limiting, dan auto-scaling.
- **MAC spoofing** memodelkan port security, autentikasi 802.1X, dan deteksi MAC flapping oleh SIEM.
- **Defense in depth** menghitung peluang keberhasilan serangan pada beberapa tahap dan mengevaluasi risiko ketika satu kontrol gagal.

## Teknologi

- HTML5
- CSS3 dengan custom properties dan media queries
- JavaScript vanilla tanpa framework
- SVG untuk topologi jaringan dan animasi paket
- Web Storage API untuk menyimpan tema
- Google Fonts: Schibsted Grotesk dan IBM Plex Mono

## Pengembangan

Tidak ada pipeline build atau test runner yang dikonfigurasi.

Untuk mengembangkan aplikasi:

1. Edit `index.html`, `script.js`, atau `style.css`.
2. Jalankan server lokal.
3. Uji seluruh alur lab.
4. Periksa navigasi keyboard, mode gelap, dan `prefers-reduced-motion`.
5. Pastikan simulator, tabel status, animasi paket, dan hasil akhir tetap sinkron.

Sebagian besar materi pembelajaran didefinisikan sebagai data di `script.js`, terutama:

- `QS` — pertanyaan Triad CIA
- `SCEN` — skenario simulasi serangan
- `EM` — contoh email
- `STAGES` — tahapan serangan
- `CTRL` — kontrol pertahanan

Pilihan tema disimpan di `localStorage` menggunakan key `tc751.theme`.

## Referensi Materi

Aplikasi membahas konsep keamanan jaringan seperti:

- Triad CIA
- ARP spoofing
- DHCP snooping
- Dynamic ARP Inspection
- 802.1X dan RADIUS
- WPA2/WPA3-Enterprise
- DDoS
- Phishing dan business email compromise
- MFA
- Segmentasi jaringan
- EDR dan SIEM
- Defense in depth

## Lisensi

Belum ada file lisensi di repository ini. Tambahkan file `LICENSE` apabila proyek akan didistribusikan dengan ketentuan lisensi tertentu.
````
