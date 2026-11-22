/**
 * ==============================================================================
 * DATA LAYER: KOEFISIEN MATERIAL PEKERJAAN TB. SUMBER BAROKAH MALANG
 * ==============================================================================
 * File ini menyimpan standar koefisien kebutuhan material per 1 m² pekerjaan
 * pada browser localStorage dengan key 'sb_koefisien'.
 * 
 * Standar koefisien disesuaikan secara realistis dengan praktik pekerjaan bangunan
 * sehari-hari di Indonesia (SNI & kebiasaan tukang / mandor di lapangan):
 * 1. Dinding: Bata Merah/Ringan, Semen Pasang/Plester/Acian, Pasir Pasang, dan Cat Tembok.
 * 2. Lantai: Keramik Lantai 40x40, Semen Perekat/Dasar, Pasir Pasang Dasar, dan Semen Nat.
 * 3. Atap: Genteng Karang Pilang/Beton, Kanal C Galvalum, Reng Galvalum/Kayu, dan Paku Seng.
 */

const STORAGE_KEY_KOEFISIEN = 'sb_koefisien';
const STORAGE_KEY_KOEFISIEN_VERSI = 'sb_koefisien_versi';
const CURRENT_KOEFISIEN_VERSION = 'v3_hanya_dinding_lantai_atap';

// Data koefisien realistis default untuk 3 kategori pekerjaan konstruksi: dinding, lantai, atap
const DEFAULT_KOEFISIEN = {
    dinding: [
        {
            kategori: "Bata",
            label: "Bata (Merah / Ringan AAC / Batako)",
            satuan: "buah",
            koefisien: 65,
            pilihanUtama: "bata merah",
            keterangan: "Standar ~65 buah bata merah per m² (lengkap adukan spesi)"
        },
        {
            kategori: "Semen",
            kataKunci: "semen",
            label: "Semen (Pasang, Plester & Acian)",
            satuan: "sak",
            koefisien: 0.25,
            pilihanUtama: "gresik",
            keterangan: "Untuk adukan spesi pasangan bata, plesteran 2 sisi, dan acian halus"
        },
        {
            kategori: "Pasir",
            kataKunci: "pasir pasang",
            label: "Pasir Pasang (Spesi & Plesteran)",
            satuan: "karung",
            koefisien: 0.80,
            pilihanUtama: "karungan",
            keterangan: "Pasir pasang ayak untuk adukan spesi bata dan plesteran dinding"
        },
        {
            kategori: "Cat",
            kataKunci: "cat",
            label: "Cat Tembok Finishing (2 Lapis)",
            satuan: "kaleng",
            koefisien: 0.05,
            pilihanUtama: "paragon",
            keterangan: "Daya sebar rata-rata 20-25 m² per kaleng 5kg untuk 2 lapis cat"
        }
    ],
    lantai: [
        {
            kategori: "Keramik",
            kataKunci: "keramik lantai",
            label: "Keramik Lantai (Ukuran 40x40)",
            satuan: "dus",
            koefisien: 1.05,
            pilihanUtama: "putih",
            keterangan: "1 dus isi ~1 m² (sudah termasuk cadangan potongan sela & sudut)"
        },
        {
            kategori: "Semen",
            kataKunci: "semen",
            label: "Semen Perekat & Rabat Dasar",
            satuan: "sak",
            koefisien: 0.18,
            pilihanUtama: "gresik",
            keterangan: "Semen untuk adukan rabat dasar lantai dan spesi perekat keramik"
        },
        {
            kategori: "Pasir",
            kataKunci: "pasir pasang",
            label: "Pasir Pasang Dasar Lantai",
            satuan: "karung",
            koefisien: 0.45,
            pilihanUtama: "karungan",
            keterangan: "Pasir pasang sebagai bantalan perata adukan dasar lantai keramik"
        },
        {
            kataKunci: "semen nat",
            label: "Semen Pengisi Nat Keramik",
            satuan: "bungkus",
            koefisien: 0.20,
            keterangan: "1 bungkus 1kg semen nat cukup untuk mengisi sela 4-5 m² keramik"
        }
    ],
    atap: [
        {
            kategori: "Genteng",
            kataKunci: "genteng",
            label: "Genteng Atap (Karang Pilang / Beton)",
            satuan: "buah",
            koefisien: 15,
            pilihanUtama: "karang pilang",
            keterangan: "Standar ~15 buah genteng karang pilang / genteng beton per m²"
        },
        {
            kategori: "Rangka Atap Galvalum",
            kataKunci: "kanal c",
            label: "Kanal C Galvalum (Kuda-kuda/Usuk)",
            satuan: "batang",
            koefisien: 0.40,
            keterangan: "Kanal C 0.75mm panjang 6 meter untuk usuk dan struktur kuda-kuda"
        },
        {
            kataKunci: "reng",
            label: "Reng Atap (Galvalum / Kayu)",
            satuan: "batang",
            koefisien: 0.60,
            pilihanUtama: "galvalum",
            keterangan: "Reng galvalum panjang 6 meter untuk penyangga dudukan genteng atap"
        },
        {
            kataKunci: "paku",
            label: "Paku Seng / Sekrup Roofing",
            satuan: "kg",
            koefisien: 0.08,
            pilihanUtama: "seng",
            keterangan: "Paku payung seng atau sekrup roofing pengikat penutup atap"
        }
    ]
};

/**
 * Mengambil data koefisien pekerjaan dari localStorage.
 * Menginisialisasi dengan data default jika belum tersedia atau versinya sudah diperbarui.
 * @returns {Object} Data koefisien per kategori pekerjaan
 */
function getKoefisien() {
    try {
        const versiTersimpan = localStorage.getItem(STORAGE_KEY_KOEFISIEN_VERSI);
        const tersimpan = localStorage.getItem(STORAGE_KEY_KOEFISIEN);

        // Jika belum ada atau versi lama (belum ada bata di dinding), mutakhirkan ke versi baru
        if (!tersimpan || versiTersimpan !== CURRENT_KOEFISIEN_VERSION) {
            localStorage.setItem(STORAGE_KEY_KOEFISIEN, JSON.stringify(DEFAULT_KOEFISIEN));
            localStorage.setItem(STORAGE_KEY_KOEFISIEN_VERSI, CURRENT_KOEFISIEN_VERSION);
            return DEFAULT_KOEFISIEN;
        }

        const parsed = JSON.parse(tersimpan);
        // Validasi struktur minimal apakah dinding sudah memiliki bata
        if (!parsed.dinding || !parsed.dinding.some(m => m.kategori === 'Bata' || m.label.toLowerCase().includes('bata'))) {
            localStorage.setItem(STORAGE_KEY_KOEFISIEN, JSON.stringify(DEFAULT_KOEFISIEN));
            localStorage.setItem(STORAGE_KEY_KOEFISIEN_VERSI, CURRENT_KOEFISIEN_VERSION);
            return DEFAULT_KOEFISIEN;
        }

        return parsed;
    } catch (e) {
        console.error("Gagal membaca koefisien dari localStorage:", e);
        return DEFAULT_KOEFISIEN;
    }
}
