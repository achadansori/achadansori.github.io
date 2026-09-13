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
