# Lumina Admin Console — Mockup

Mockup dashboard admin bergaya pastel, single-page, tanpa build step, tanpa dependency.

## Struktur

| File | Isi |
| --- | --- |
| `index.html` | Struktur UI + sprite ikon SVG inline (`<symbol id="i-*">`) |
| `styles.css` | Token design system + seluruh layout/responsive |
| `app.js` | Sparkline render, toggle theme, segmented/chip generik, shortcut ⌘K |
| `router.js` | Hash router, 6 halaman, drawer mobile, filter/pencarian, sort tabel, pengaturan |

Cara lihat: buka `index.html` langsung di browser (buka via `file://` sudah cukup, tidak butuh server).

## Routing & halaman

Router berbasis hash (`#/nama`) — tidak butuh server, bekerja di `file://`, dan tombol Back/Forward browser jalan.

| Rute | Halaman | Konten utama |
| --- | --- | --- |
| `#/overview` (default) | Overview | 4 KPI, area chart 30 hari, donut trafik, tabel pesanan, feed live, target bulanan |
| `#/analytics` | Analytics | KPI sesi/bounce/durasi, chart 14 hari, halaman terpopuler (bar), tabel kanal **sortable** |
| `#/pelanggan` | Pelanggan | KPI retensi/LTV, tabel pelanggan dengan **pencarian live + filter status + empty state** |
| `#/inventori` | Inventori | KPI stok, tabel level stok (bar kritis/menipis/aman), kapasitas gudang, restock |
| `#/pesanan` | Pesanan | KPI pesanan, tabel dengan **filter status** (semua/diproses/selesai/dibatalkan) |
| `#/pengaturan` | Pengaturan | Form profil, switch tema/animasi/email, densitas tabel, keamanan, zona berbahaya |

Menambah halaman baru: (1) `<div class="page" id="page-xxx" hidden>` di `index.html`, (2) entri di objek `PAGES` (`router.js`) berisi `title`/`sub`/`cta`, (3) `<a class="nav-item" href="#/xxx">` di sidebar. Header, tombol CTA, `document.title`, dan state aktif sidebar otomatis ikut — tidak perlu ubah markup header.

Logika per-halaman didaftarkan di `hydrate(name)` dan di-bind **sekali** lewat `bind()` (WeakSet), jadi bolak-balik antar menu tidak menumpuk event listener.

Interaksi yang benar-benar berfungsi (bukan dekorasi):

- Navigasi sidebar (klik + keyboard, anchor asli), tombol Back browser, hash langsung.
- Pencarian pelanggan (`input` event) + filter status + tombol reset di empty state.
- Filter status pesanan, dengan hitungan baris hidup (`#ordCount`).
- Sort tabel kanal via klik/Enter/Space pada header, `aria-sort` mengikuti arah.
- Switch tema (sinkron dua arah dengan ikon bulan di header), animasi, notifikasi email.
- Densitas tabel nyaman/rapat, disimpan di `localStorage['lumina-density']`.
- Simpan profil (simulasi + pesan status), tombol hapus workspace dua langkah (armed → konfirmasi, reset otomatis 4 detik).

Anchor di dalam konten mockup yang belum punya tujuan tetap tidak melakukan apa-apa — jangan tambahkan `href="#"` baru tanpa handler, itu memantulkan halaman ke atas.

## Design system (token di `:root`)

Kelas layout baru yang dipakai halaman: `.bars` (bar list horizontal), `.switch`, `.radio`, `.form`/`.field`, `.empty-state`, `.bar-inline` dengan level `.lvl-ok/.lvl-warn/.lvl-bad`, `.pale-right` (kolom kanan lebih lebar). Transisi antar-halaman pakai `.page.is-in` dan otomatis mati lewat `prefers-reduced-motion`.

Palet pastel, aksen ungu→pink:

| Token | Light | Peran |
| --- | --- | --- |
| `--bg` | `#f6f4fb` | Latar halaman + 3 radial glow |
| `--card` | `#ffffff` | Permukaan kartu |
| `--border` | `#ece9f5` | Garis halus |
| `--ink` | `#2c2843` | Teks utama (kontras 14,1:1) |
| `--ink-2` | `#5d5878` | Teks sekunder (6,7:1) |
| `--ink-3` | `#6e6889` | Label kecil (5,2:1) |
| `--accent` | `#7c6cf5` | Aksi utama, grafik |
| `--accent-2` | `#f2a6c4` | Garis pembanding tahun lalu, badge |
| `--mint` / `--lilac` / `--peach` / `--sky` | `#5fd0a8` / `#a78bfa` / `#f8a978` / `#7cb8f2` | Ikon KPI + seri donut |
| `--ok` / `--warn` / `--bad` | `#3fae86` / `#c98a35` / `#d97590` | Status tag |

Font: Plus Jakarta Sans (300–800). Radius: 10 / 14 / 20 / 26 px. Shadow dua lapis (dekat + jauh) supaya kartu terasa ringan, bukan tebal.

Dark mode: `[data-theme="dark"]` menimpa token yang sama. Default **light**; pilihan user disimpan di `localStorage['lumina-theme']`.

## Aturan kerja

1. **Jangan hardcode warna/font di komponen.** Tambah atau pakai token di `:root`; kalau perlu nuansa baru, buat token (mis. `--lilac-soft`) supaya dark mode ikut jalan.
2. **Warna cuma pelengkap.** Status selalu punya teks (`Selesai`, `Diproses`, `Dibatalkan`) + bentuk; jangan andalkan hue saja.
3. **Ikon wajib SVG dari sprite.** Tidak ada emoji sebagai ikon struktural. Ikon dekoratif di samping teks pakai `aria-hidden="true"`; tombol ikon wajib punya `aria-label`.
4. **Kontras minimum 4.5:1** untuk teks normal di kedua tema. Kalau menggeser nilai `--ink-3`, ukur ulang.
5. **Satu layar = status utuh.** Jangan menambah baris yang memaksa scroll pada viewport 1440×900; drill-down tetap harus punya jalan balik.
6. **`prefers-reduced-motion` dihormati.** Animasi masuk kartu dan pulse `Live` dimatikan lewat media query di `styles.css` + guard di `app.js`.

## Responsive (sudah diverifikasi)

| Lebar | Perilaku |
| --- | --- |
| ≥1181px | Sidebar sticky 264px, KPI 4 kolom, chart 601px + donut 350px |
| ≤1180px | KPI 2 kolom, semua baris jadi 1 kolom |
| ≤900px | Sidebar jadi drawer (translateX), tombol hamburger muncul, scrim + Escape menutup |
| ≤640px | KPI 1 kolom, donut di atas legend, kartu padding 15px |

Diuji tanpa horizontal scroll pada 390px dan 768px. Tabel punya `overflow-x` sendiri (`.table-scroll`) — **jangan** hapus `min-width:0` / `overflow:hidden` di `.card.table-card`, itu yang mencegah tabel melebarkan halaman.

## Aksesibilitas yang sudah terpasang

- Skip-link tidak perlu karena tidak ada nav berulang sebelum konten, tapi landmark lengkap: `<aside aria-label>` + `<main>`.
- `:focus-visible` global 2,5px `--accent`.
- Segmented control & filter chip memakai `aria-pressed`; toggle theme `aria-pressed` + label dinamis.
- Progress target bulanan: `role="progressbar"` dengan `aria-valuenow` 78.
- Pencarian bisa difokus dengan `Ctrl/⌘ + K`.
- Grafik SVG punya `role="img"` + `aria-label` berisi angkanya; angka juga muncul sebagai teks di panel, jadi tidak ada info yang cuma di dalam gambar.

## Data

Semua angka **dummy** dan ditulis langsung di markup. Grafik area memakai path Bezier statis (bukan chart library) supaya file tetap <50 KB dan tidak butuh jaringan. Sparkline dibangkitkan dari `data-spark="8,12,9,..."` di `app.js`.

Kalau disambungkan ke API sungguhan: point sparkline → array angka dari endpoint; path area → generator SVG dari timeseries; donut → hitung `stroke-dasharray` dari persentase (`persen/100 × 289`, keliling r=46).
