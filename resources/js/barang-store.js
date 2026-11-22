/**
 * ============================================================================
 * Modul Penyimpanan Data Barang (barang-store.js)
 * TB. Sumber Barokah Malang
 * ============================================================================
 * CATATAN PENTING:
 * 1. Penyimpanan menggunakan localStorage browser ini bersifat SEMENTARA
 *    karena cakupan tugas saat ini hanya sampai tahap Frontend (tanpa database).
 *    Pada tahap pengembangan Backend selanjutnya, fungsi-fungsi di bawah ini
 *    dapat digantikan dengan pemanggilan API / Database MySQL melalui Laravel.
 * 2. Data barang yang disimpan di sini akan dibaca bersama oleh Halaman Katalog
 *    nantinya melalui fungsi `getBarang()`.
 */

export const STORAGE_KEY = 'sips_barang';

/**
 * Data awal (seed) 6 barang bahan bangunan realistis.
 * Mencakup status stok: "Aman", "Menipis", dan "Habis".
 */
const DATA_AWAL_BARANG = [
    {
        id: 1,
        nama: 'Semen Gresik 50 kg (Sak)',
        stok: 45,
        stokMinimum: 15,
        harga: 65000,
    },
    {
        id: 2,
        nama: 'Pasir Pasang Lumajang (Sak)',
        stok: 8,
        stokMinimum: 10,
        harga: 25000,
    },
    {
        id: 3,
        nama: 'Besi Beton Polos 8 mm (Batang)',
        stok: 32,
        stokMinimum: 12,
        harga: 42000,
    },
    {
        id: 4,
        nama: 'Cat Tembok Avitex Putih 5 kg',
        stok: 0,
        stokMinimum: 5,
        harga: 135000,
    },
    {
        id: 5,
        nama: 'Keramik Lantai Putih 40x40 (Dus)',
        stok: 6,
        stokMinimum: 8,
        harga: 58000,
    },
    {
        id: 6,
        nama: 'Paku Kayu 5 cm (Kg)',
        stok: 24,
        stokMinimum: 5,
        harga: 18000,
    },
];

/**
 * Menyimpan array daftar barang ke localStorage.
 * @param {Array} daftarBarang
 */
function simpanKeStorage(daftarBarang) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(daftarBarang));
}

/**
 * Mengambil seluruh data barang dari localStorage.
 * Jika kunci localStorage belum pernah dibuat (masih kosong),
 * otomatis mengisi dengan 6 data contoh bahan bangunan.
 * Halaman Katalog nantinya juga akan memanggil fungsi getBarang() ini.
 *
 * @returns {Array<{id: number, nama: string, stok: number, stokMinimum: number, harga: number}>}
 */
export function getBarang() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            simpanKeStorage(DATA_AWAL_BARANG);
            return [...DATA_AWAL_BARANG];
        }

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            simpanKeStorage(DATA_AWAL_BARANG);
            return [...DATA_AWAL_BARANG];
        }

        return parsed;
    } catch (error) {
        console.error('Gagal membaca data barang dari localStorage:', error);
        return [...DATA_AWAL_BARANG];
    }
}

/**
 * Menghitung status ketersediaan stok barang secara otomatis.
 * Aturan:
 * - stok === 0                  -> "Habis"
 * - 0 < stok <= stokMinimum     -> "Menipis"
 * - stok > stokMinimum          -> "Aman"
 *
 * @param {{stok: number, stokMinimum: number}} barang
 * @returns {'Habis' | 'Menipis' | 'Aman'}
 */
export function hitungStatus(barang) {
    const stok = Number(barang.stok) || 0;
    const stokMinimum = Number(barang.stokMinimum) || 0;

    if (stok <= 0) {
        return 'Habis';
    }
    if (stok <= stokMinimum) {
        return 'Menipis';
    }
    return 'Aman';
}

/**
 * Menambahkan barang baru ke localStorage dengan ID unik otomatis.
 *
 * @param {{nama: string, stok: number, stokMinimum: number, harga: number}} barangBaru
 * @returns {{id: number, nama: string, stok: number, stokMinimum: number, harga: number}}
 */
export function tambahBarang(barangBaru) {
    const daftar = getBarang();
    const maxId = daftar.reduce((maks, item) => Math.max(maks, Number(item.id) || 0), 0);

    const itemTersimpan = {
        id: maxId + 1,
        nama: String(barangBaru.nama).trim(),
        stok: Number(barangBaru.stok),
        stokMinimum: Number(barangBaru.stokMinimum),
        harga: Number(barangBaru.harga),
    };

    daftar.push(itemTersimpan);
    simpanKeStorage(daftar);
    return itemTersimpan;
}

/**
 * Memperbarui data barang berdasarkan ID.
 *
 * @param {number|string} id
 * @param {{nama: string, stok: number, stokMinimum: number, harga: number}} dataBaru
 * @returns {object|null}
 */
export function ubahBarang(id, dataBaru) {
    const daftar = getBarang();
    const index = daftar.findIndex((item) => Number(item.id) === Number(id));

    if (index === -1) {
        return null;
    }

    daftar[index] = {
        ...daftar[index],
        nama: String(dataBaru.nama).trim(),
        stok: Number(dataBaru.stok),
        stokMinimum: Number(dataBaru.stokMinimum),
        harga: Number(dataBaru.harga),
    };

    simpanKeStorage(daftar);
    return daftar[index];
}

/**
 * Menghapus satu barang berdasarkan ID.
 *
 * @param {number|string} id
 * @returns {boolean}
 */
export function hapusBarang(id) {
    const daftar = getBarang();
    const daftarBaru = daftar.filter((item) => Number(item.id) !== Number(id));

    if (daftarBaru.length === daftar.length) {
        return false;
    }

    simpanKeStorage(daftarBaru);
    return true;
}
