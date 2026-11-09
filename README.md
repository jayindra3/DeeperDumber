# Deeper Dumber

Game arcade puzzle-platformer 2D bertema level devil. Murni HTML + CSS + JavaScript (tanpa build, tanpa dependensi).

## Struktur

```
deeper-dumber/
├── index.html   halaman + menu + layar game over / selamat
├── style.css    tampilan (palet 60 cokelat : 30 krem : 10 hijau)
├── game.js      seluruh logika, level, dan rendering canvas
└── README.md
```

## Deploy ke GitHub Pages

1. Buat repository baru, lalu unggah keempat file ini ke root repository.
2. Buka **Settings → Pages**.
3. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`.
4. Tunggu sekitar satu menit. Game bisa dibuka di `https://<username>.github.io/<nama-repo>/`.

Catatan pameran: font *Press Start 2P* dimuat dari Google Fonts. Jika perangkat pameran offline, tampilan otomatis memakai font monospace.

## Kontrol

| Aksi | Keyboard | Layar sentuh |
|---|---|---|
| Jalan | ← → atau A D | tombol ◀ ▶ |
| Lompat | ↑ / W / Spasi | tombol ▲ |
| Ulang dari awal | R (saat game over) | tombol di layar |

## Alur game

Menu (pilih warna putih, cokelat, atau abu-abu) → karakter berjalan di padang rumput → tanah runtuh → jatuh ke labirin → cari pintu hijau → pintu kabur ke titik awal → kembali ke sana → layar selamat.

## Rintangan (semua instant death, semua berpola)

- Lantai amblas saat pemain mendekat.
- Anak tangga lenyap dan berganti duri.
- Duri muncul dari bawah lantai.
- Duri jatuh dari langit-langit saat didekati.
- Tembok berduri mengejar dari belakang.
- Panah melesat, bergantian rendah lalu tinggi.
- Genangan sulfur: tenang, menggelembung, lalu menyembur.
- Tetesan sulfur dari langit-langit (ada tanda tetesan membesar dulu).
- Dua makhluk hijau mondar-mandir.
- Pintu finish kabur ke titik awal, dengan tembok duri yang mengejar dari kanan. Kunci ternyata tidak diperlukan.

## Koin (opsional)

Ada 5 koin, masing-masing memberi hadiah. Koin ke-5 tersembunyi di balik dinding kiri tempat karakter pertama muncul. Dinding itu palsu dan bisa ditembus.

## Mengubah tingkat kesulitan

Semua angka ada di `game.js`:

- Kecepatan tembok pengejar: `v:.75` (maju) dan `v:1` (kembali).
- Posisi pemicu jebakan: fungsi `at(kolom, aksi)` di dalam `build()`.
- Jarak jebakan: argumen kolom pada `box(...)`, `sp(...)`, dan `fall(...)`.
- Kekuatan lompat: `-4.3`. Gravitasi: `.22`.
