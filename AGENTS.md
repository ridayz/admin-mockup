# Lumina Admin Console — Mockup

Mockup dashboard admin bergaya pastel, single-page, tanpa build step, tanpa dependency.

## Struktur

| File | Isi |
| --- | --- |
| `index.html` | Struktur UI + sprite ikon SVG inline (`<symbol id="i-*">`) |
| `styles.css` | Token design system + seluruh layout/responsive |
| `app.js` | Sparkline render, toggle theme, drawer mobile, filter chip |

Cara lihat: buka `index.html` langsung di browser (buka via `file://` sudah cukup, tidak butuh server).

## Design system (token di `:root`)

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
