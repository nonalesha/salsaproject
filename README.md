# Lime Premium — Katalog Aplikasi yang Bisa Diinstal (PWA)

## Isi proyek
Aplikasi web **Progressive Web App (PWA)** yang bisa dipasang ke layar utama Android lewat Chrome atau Samsung Internet. Tidak perlu Google Play Store. Desain hijau pastel; 36 aplikasi beserta ikon lokal; harga contoh harian, bulanan, tahunan; pencarian, filter kategori, favorit, keranjang, form pembeli, salin pesanan, dan checkout ke WhatsApp penjual. Bisa menampilkan katalog tanpa koneksi setelah kunjungan pertama.

**Penting:** Proyek ini **BUKAN file APK**. PWA perlu diunggah ke hosting HTTPS sebelum tombol instal bisa digunakan pada Android. Paket ZIP ini adalah *source code lengkap* dan siap dihosting, bukan situs yang sudah tayang.

## Cara pasang di Android (tanpa coding)
1. Ekstrak file ZIP `Lime-Premium-PWA.zip` di komputer, atau gunakan pengelola file ZIP pada HP.
2. Buka `data.js` untuk mengubah nama produk, **harga contoh**, dan `STORE_DEFAULTS.whatsapp` (mis. `6281234567890`). Jangan tambahkan `+`, spasi, atau angka 0 di depan.
3. Unggah **semua isi folder** `lime-premium` ke layanan hosting statis HTTPS seperti **Netlify Drop** (`https://app.netlify.com/drop`) dari komputer atau dari Chrome Android yang mendukung pemilihan folder. Perhatikan agar `index.html` ada di akar situs yang diunggah, bukan di dalam subfolder.
4. Buka alamat situs HTTPS hasil unggah tersebut di Chrome Android → menu ⋮ → **Instal aplikasi / Tambahkan ke layar utama**. Untuk Samsung Internet, gunakan menu **Tambah halaman ke → Layar depan**.
5. Ikon `Lime Premium` muncul di layar utama dan terbuka seperti aplikasi.

Jika di PC ingin mencoba sebelum mengunggah: buka terminal pada folder proyek, jalankan `python -m http.server 8000`, lalu akses `http://localhost:8000`. Tampilan dan fitur berjalan di localhost, tetapi untuk pemasangan pada HP tetap perlu HTTPS.

## Pengeditan data dan harga
`data.js` berisi 36 produk, masing-masing menggunakan format:

```js
{id:'canva', name:'Canva', category:'Produktivitas', tag:'Desain kreatif', prices:[5000,30000,230000], color:'#27A7B8', symbol:'C'},
```

Urutan `prices` = `[harian, bulanan, tahunan]` dalam rupiah. **Angka yang sudah diisi adalah simulasi harga toko, bukan harga resmi layanan.** Layanan yang sebenarnya tidak menawarkan salah satu durasi tersebut perlu disesuaikan sebelum digunakan untuk jualan.

Untuk mengatur kontak penjual, edit:

```js
window.STORE_DEFAULTS = { name:'Lime Premium', whatsapp:'6281234567890' };
```

Pengaturan melalui tombol ⚙ dalam aplikasi **hanya tersimpan di perangkat yang sedang digunakan** (localStorage). Pengaturan itu tidak otomatis berlaku untuk pengunjung lain. Untuk memperbarui seluruh situs, edit `data.js`, ubah nomor versi `CACHE_NAME` di `sw.js` (mis. `lime-premium-v2`), lalu unggah ulang semua file situs.

## Catatan transaksi dan privasi
- Checkout **tidak memproses pembayaran**. Form menghasilkan teks pesanan; jika nomor WA penjual sudah diisi, tombol “Kirim via WhatsApp” membuka WhatsApp untuk mengirim pesanan.
- Harga, stok, jenis paket, dan cara pembayaran harus dikonfirmasi oleh penjual, bukan dianggap sudah dibayar/diaktifkan.
- Data pembeli tidak dikirim ke server aplikasi. Data dimasukkan ke tautan WhatsApp penjual saat pembeli memilih mengirim, atau bisa disalin ke clipboard.
- Keranjang dan favorit disimpan lokal dalam browser, bukan tersinkronisasi antarperangkat.
- Ikon lokal adalah desain bergaya untuk masing-masing aplikasi, **bukan semua logo resmi**. Gunakan aset merek yang diizinkan jika hendak dipasarkan secara komersial.
- Pastikan kamu memiliki hak atau izin untuk menjual kembali lisensi/langganan pihak ketiga. Jangan menawarkan akses berbagi akun tanpa izin jika melanggar aturan penyedia.

## Berkas
`index.html` (UI), `style.css` (tema), `data.js` (daftar produk dan harga), `app.js` (fitur), `assets/icons/*.svg` (36 ikon), `assets/branding/` (ikon instalasi), `manifest.webmanifest` (PWA), `sw.js` (cache offline).

### Opsi APK asli
Jika nanti ingin APK yang bisa diunduh dan dipasang secara langsung, proyek PWA ini bisa dibungkus ke WebView/Trusted Web Activity via Android Studio/Bubblewrap. **APK belum dibangun** pada paket ini.
