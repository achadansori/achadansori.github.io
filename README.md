# Ansori — Website React mandiri

Website portfolio React + Vite dengan tema hitam putih dan foto berwarna. Beranda, katalog proyek, detail proyek, blog, artikel lengkap, dan CV berada di aplikasi ini. Konten publik diambil dari achadansori.com dan aset situs tersebut disalin ke `public/assets/`.

## Menjalankan

```bash
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite. Semua halaman dapat dibuka dari preview yang sama.

## Mengedit

- `src/main.jsx`: beranda dan navigasi global.
- `src/Pages.jsx`: katalog, pencarian, pembaca artikel, detail proyek, dan CV.
- `src/content.json`: seluruh konten hasil migrasi. Field `html` menyimpan isi artikel/proyek yang sudah dibersihkan dari script dan event handler.
- `src/style.css`: tema dan layout.
- `public/images/`: foto beranda.
- `public/assets/`: gambar dan dokumen konten.
- `src/chat/faq.json`: tanya-jawab asisten portofolio (lihat di bawah).

## Asisten portofolio

Tombol "Ask about my work" membuka asisten yang menjawab pertanyaan tentang portofolio dalam bahasa Inggris atau Indonesia. Asisten ini tidak menyusun kalimat sendiri: model embedding `multilingual-e5-small` berjalan di browser pengunjung dan mencocokkan pertanyaan dengan jawaban di `src/chat/faq.json` atau bagian halaman proyek, CV, dan artikel. Pertanyaan di luar portofolio dijawab "tidak tahu". Tidak ada server atau API key.

- Desktop memuat model (sekitar 150 MB sekali, lalu tersimpan di cache browser) saat panel dibuka. Di HP atau mode hemat data, pengunjung memakai pencarian kata kunci sampai menekan "Turn on smart search".
- Mengubah jawaban: edit `src/chat/faq.json` (setiap entri berisi variasi pertanyaan `q` dan jawaban `a` dalam `en`/`id`). Tulis hanya fakta yang ada di portofolio.
- Memeriksa jawaban: `npm run chat:index && npm run chat:eval`. Skrip evaluasi menguji sekitar 40 pertanyaan, termasuk pertanyaan di luar topik yang harus ditolak. Tambahkan kasus di `scripts/chat-eval.mjs` bila menambah topik.
- `npm run build` membuat `public/chat-index.json` dan membutuhkan akses ke Hugging Face untuk mengunduh model. Tanpa akses, build tetap selesai dan asisten hanya memakai pencarian kata kunci.
- Di Linux x64, `npm ci` mencoba mengunduh binary CUDA yang tidak diperlukan. Jika gagal, jalankan `ONNXRUNTIME_NODE_INSTALL=skip npm ci`.

## Build

```bash
npm run build
```

Folder `dist/` berisi hasil siap hosting. Build membuat `index.html` untuk setiap alamat lama, sehingga membuka atau me-refresh URL detail langsung tetap bekerja tanpa Node.js atau SPA rewrite.

## Rumahweb

1. Backup website lama sebelum mengganti file.
2. Upload dan ekstrak **isi** `ansori-rumahweb-upload.zip` ke document root domain achadansori.com (umumnya `public_html`; ikuti pengaturan domain hosting Anda).
3. Pastikan `index.html`, `assets/`, `images/`, `projects/`, `blog/`, dan `cv/` dari paket baru berada langsung di document root.
4. Periksa beranda, proyek, artikel, CV, dan beberapa gambar setelah upload.
5. Website baru tidak membutuhkan folder website lama. File lama dapat dihapus setelah backup dan pemeriksaan upload. Jika menghapus file lama setelah ekstraksi, jangan ikut menghapus folder baru yang memiliki nama sama.

Paket ini ditujukan untuk **root domain**, bukan subfolder `/new/`. Untuk pratinjau sebelum penggantian, gunakan server lokal atau document root subdomain terpisah. Tidak perlu mengunggah source, `node_modules`, atau menjalankan Node.js di hosting.

Tautan GitHub, LinkedIn, YouTube, referensi eksternal, dan email tetap menuju layanan masing-masing. Video embed membutuhkan koneksi layanan penyedianya. Font memiliki fallback jika Google Fonts tidak dapat diakses.

## Pemeriksaan

Build produksi dan pemeriksaan otomatis jalur halaman/aset dilakukan sebelum ZIP dibuat. Pemeriksaan visual/interaksi manual di browser belum dilakukan.
